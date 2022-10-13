import {
  UnorderedMap,
  LookupMap,
  Bytes,
  near,
  UnorderedSet,
  assert,
} from "near-sdk-js/lib/index";
import { PromiseResult } from "near-sdk-js/lib/types/index";
import { assertOneYocto, IntoStorageKey, Option } from "near-sdk-js/lib/utils";
import { TokenMetadata } from "../metadata";
import {
  hash_account_id,
  refund_approved_account_ids,
  refund_deposit,
  refund_deposit_to_account,
} from "../utils";
import { NftMint, NftTransfer } from "../events";
import { NonFungibleTokenResolver } from "./resolver";
import { AccountId } from "near-sdk-js/lib/types/index";
import { Token, TokenId } from "../token";

export interface NonFungibleTokenCore {
  nft_transfer(
    receiver_id: AccountId,
    token_id: TokenId,
    approval_id: Option<bigint>,
    memo: Option<string>
  );
  nft_transfer_call(
    receiver_id: AccountId,
    token_id: TokenId,
    approval_id: Option<bigint>,
    memo: Option<string>,
    msg: string
  );
  nft_token(token_id: TokenId): Option<Token>;
}

const GAS_FOR_RESOLVE_TRANSFER = 5_000_000_000_000n;
const GAS_FOR_NFT_TRANSFER_CALL =
  25_000_000_000_000n + GAS_FOR_RESOLVE_TRANSFER;

function repeat(str: string, n: number) {
  return Array(n + 1).join(str);
}

export class NonFungibleToken
  implements NonFungibleTokenCore, NonFungibleTokenResolver
{
  public owner_id: string;
  public extra_storage_in_bytes_per_token: bigint;
  public owner_by_id: UnorderedMap<AccountId>;
  public token_metadata_by_id: Option<LookupMap<TokenMetadata>>;
  public tokens_per_owner: Option<LookupMap<UnorderedSet<string>>>;
  public approvals_by_id: Option<LookupMap<{ [approvals: string]: bigint }>>;
  public next_approval_id_by_id: Option<LookupMap<bigint>>;

  constructor(
    owner_by_id_prefix: IntoStorageKey,
    owner_id: string,
    token_metadata_prefix: Option<IntoStorageKey>,
    enumeration_prefix: Option<IntoStorageKey>,
    approval_prefix: Option<IntoStorageKey>
  ) {
    let approvals_by_id: Option<LookupMap<{ [approvals: string]: bigint }>>;
    let next_approval_id_by_id: Option<LookupMap<bigint>>;
    if (approval_prefix) {
      const prefix = approval_prefix.into_storage_key();
      approvals_by_id = new LookupMap(prefix);
      next_approval_id_by_id = new LookupMap(prefix);
    } else {
      approvals_by_id = null;
      next_approval_id_by_id = null;
    }

    this.owner_id = owner_id;
    this.extra_storage_in_bytes_per_token = 0n;
    this.owner_by_id = new UnorderedMap(owner_by_id_prefix.into_storage_key());
    this.token_metadata_by_id = token_metadata_prefix
      ? new LookupMap(token_metadata_prefix.into_storage_key())
      : null;
    this.approvals_by_id = approvals_by_id;
    this.next_approval_id_by_id = next_approval_id_by_id;
  }

  init() {
    this.measure_min_token_storage_cost();
  }

  measure_min_token_storage_cost() {
    const initial_storage_usage = near.storageUsage();
    // 64 Length because this is the max account id length
    const tmp_token_id = repeat("a", 64);
    const tmp_owner_id = repeat("a", 64);

    // 1. set some dummy data
    this.owner_by_id.set(tmp_token_id, tmp_owner_id);
    if (this.token_metadata_by_id) {
      this.token_metadata_by_id.set(
        tmp_token_id,
        new TokenMetadata(
          repeat("a", 64),
          repeat("a", 64),
          repeat("a", 64),
          repeat("a", 64),
          1n,
          null,
          null,
          null,
          null,
          null,
          null,
          null
        )
      );
    }
    if (this.tokens_per_owner) {
      const u = new UnorderedSet<string>(
        new TokensPerOwner(near.sha256(tmp_owner_id)).into_storage_key()
      );
      u.set(tmp_token_id);
      this.tokens_per_owner.set(tmp_owner_id, u);
    }
    if (this.approvals_by_id) {
      const approvals = {};
      approvals[tmp_owner_id] = 1n;
      this.approvals_by_id.set(tmp_token_id, approvals);
    }
    if (this.next_approval_id_by_id) {
      this.next_approval_id_by_id.set(tmp_token_id, 1n);
    }
    const u = new UnorderedSet<string>(
      new TokenPerOwnerInner(hash_account_id(tmp_owner_id)).into_storage_key()
    );
    if (this.tokens_per_owner) {
      this.tokens_per_owner.set(tmp_owner_id, u);
    }

    // 2. see how much space it took
    this.extra_storage_in_bytes_per_token =
      near.storageUsage() - initial_storage_usage;

    // 3. roll it all back
    if (this.next_approval_id_by_id) {
      this.next_approval_id_by_id.remove(tmp_token_id);
    }
    if (this.approvals_by_id) {
      this.approvals_by_id.remove(tmp_token_id);
    }
    if (this.tokens_per_owner) {
      this.tokens_per_owner.remove(tmp_owner_id);
    }
    if (this.token_metadata_by_id) {
      this.token_metadata_by_id.remove(tmp_token_id);
    }
    if (this.tokens_per_owner) {
      this.tokens_per_owner.remove(tmp_owner_id);
    }
  }

  internal_transfer_unguarded(token_id: string, from: string, to: string) {
    this.owner_by_id.set(token_id, to);

    if (this.tokens_per_owner) {
      const owner_tokens = this.tokens_per_owner.get(from);
      if (owner_tokens == null) {
        throw new Error("Unable to access tokens per owner in unguarded call.");
      }
      const owner_tokens_set = UnorderedSet.deserialize(
        owner_tokens as UnorderedSet
      );
      if (owner_tokens_set.isEmpty()) {
        this.tokens_per_owner.remove(from);
      } else {
        this.tokens_per_owner.set(from, owner_tokens_set);
      }

      let receiver_tokens = this.tokens_per_owner.get(to);
      if (receiver_tokens == null) {
        receiver_tokens = new UnorderedSet(
          new TokensPerOwner(near.sha256(to)).into_storage_key()
        );
      } else {
        receiver_tokens = UnorderedSet.deserialize(
          receiver_tokens as UnorderedSet
        );
      }
      (receiver_tokens as UnorderedSet).set(token_id);
      this.tokens_per_owner.set(to, receiver_tokens);
    }
  }

  internal_transfer(
    sender_id: string,
    receiver_id: string,
    token_id: string,
    approval_id: Option<bigint>,
    memo: Option<string>
  ): [string, Map<string, bigint> | null] {
    const owner_id = this.owner_by_id.get(token_id);
    if (owner_id == null) {
      throw new Error("Token not found");
    }

    const approved_account_ids = this.approvals_by_id?.remove(token_id);

    let sender_id_authorized: Option<string>;
    if (sender_id != owner_id) {
      if (!approved_account_ids) {
        throw new Error("Unauthorized");
      }

      const actual_approval_id = (approved_account_ids as any)[sender_id];
      if (!actual_approval_id) {
        throw new Error("Sender not approved");
      }

      assert(
        approval_id == null || approval_id == actual_approval_id,
        `The actual approval_id ${actual_approval_id} is different from the given ${approval_id}`
      );
      sender_id_authorized = sender_id;
    } else {
      sender_id_authorized = null;
    }
    assert(owner_id != receiver_id, "Current and next owner must differ");
    this.internal_transfer_unguarded(token_id, owner_id as string, receiver_id);
    NonFungibleToken.emit_transfer(
      owner_id as string,
      receiver_id,
      token_id,
      sender_id_authorized,
      memo
    );
    return [
      owner_id as string,
      approved_account_ids == null
        ? null
        : (approved_account_ids as Map<string, bigint>),
    ];
  }

  static emit_transfer(
    owner_id: string,
    receiver_id: string,
    token_id: string,
    sender_id: Option<string>,
    memo: Option<string>
  ) {
    new NftTransfer(
      owner_id,
      receiver_id,
      [token_id],
      sender_id && sender_id == owner_id ? sender_id : null,
      memo
    ).emit();
  }

  internal_mint(
    token_id: string,
    token_owner_id: string,
    token_metadata: Option<TokenMetadata>
  ): Token {
    const token = this.internal_mint_with_refund(
      token_id,
      token_owner_id,
      token_metadata,
      near.predecessorAccountId()
    );
    new NftMint(token.owner_id, [token.token_id], null).emit();
    return token;
  }

  internal_mint_with_refund(
    token_id: string,
    token_owner_id: string,
    token_metadata: Option<TokenMetadata>,
    refund_id: Option<string>
  ): Token {
    let initial_storage_usage: Option<[string, bigint]> = null;
    if (refund_id) {
      initial_storage_usage = [refund_id, near.storageUsage()];
    }
    if (this.token_metadata_by_id && token_metadata == null) {
      throw new Error("Must provide metadata");
    }
    if (this.owner_by_id.get(token_id)) {
      throw new Error("token_id must be unique");
    }

    const owner_id = token_owner_id;
    this.owner_by_id.set(token_id, owner_id);
    this.token_metadata_by_id?.set(token_id, token_metadata);
    if (this.tokens_per_owner) {
      let token_ids = this.tokens_per_owner.get(owner_id) as UnorderedSet;
      token_ids = UnorderedSet.deserialize(token_ids);
      token_ids.set(token_id);
      this.tokens_per_owner.set(owner_id, token_ids);
    }

    const approved_account_ids = this.approvals_by_id
      ? new Map<AccountId, bigint>()
      : null;
    if (initial_storage_usage) {
      const [id, storage_usage] = initial_storage_usage;
      refund_deposit_to_account(near.storageUsage() - storage_usage, id);
    }
    return new Token(token_id, owner_id, token_metadata, approved_account_ids);
  }

  nft_transfer(
    receiver_id: string,
    token_id: string,
    approval_id: Option<bigint>,
    memo: Option<string>
  ) {
    assertOneYocto();
    const sender_id = near.predecessorAccountId();
    this.internal_transfer(sender_id, receiver_id, token_id, approval_id, memo);
  }

  nft_transfer_call(
    receiver_id: string,
    token_id: string,
    approval_id: Option<bigint>,
    memo: Option<string>,
    msg: string
  ) {
    assertOneYocto();
    const sender_id = near.predecessorAccountId();
    const [old_owner, old_approvals] = this.internal_transfer(
      sender_id,
      receiver_id,
      token_id,
      approval_id,
      memo
    );
    // TODO: ext_nft_receiver
  }

  nft_token(token_id: string): Option<Token> {
    const owner_id = this.owner_by_id.get(token_id) as Option<AccountId>;
    if (owner_id == null) {
      return null;
    }
    const metadata = this.token_metadata_by_id?.get(
      token_id
    ) as Option<TokenMetadata>;
    const approved_account_ids =
      (this.approvals_by_id?.get(token_id) as Option<Map<AccountId, bigint>>) ||
      new Map<AccountId, bigint>();
    return new Token(token_id, owner_id, metadata, approved_account_ids);
  }

  nft_resolve_transfer(
    previous_owner_id: string,
    receiver_id: string,
    token_id: string,
    approved_account_ids: Option<Map<string, bigint>>
  ): boolean {
    let must_revert: boolean;
    const p = near.promiseResult(0);
    if (p === PromiseResult.NotReady) {
      throw new Error();
    } else if (p === PromiseResult.Failed) {
      must_revert = true;
    } else {
      try {
        const yes_or_no = JSON.parse(p as Bytes);
        if (typeof yes_or_no == "boolean") {
          must_revert = yes_or_no;
        } else {
          must_revert = true;
        }
      } catch (_e) {
        must_revert = true;
      }
    }

    if (!must_revert) {
      return true;
    }

    const current_owner = this.owner_by_id.get(token_id) as Option<AccountId>;
    if (current_owner) {
      if (current_owner != receiver_id) {
        return true;
      }
    } else {
      if (approved_account_ids) {
        refund_approved_account_ids(previous_owner_id, approved_account_ids);
      }
      return true;
    }

    this.internal_transfer_unguarded(token_id, receiver_id, previous_owner_id);

    if (this.approvals_by_id) {
      let receiver_approvals = this.approvals_by_id.get(token_id) as Option<
        Map<AccountId, bigint>
      >;
      if (receiver_approvals) {
        receiver_approvals = new Map(Object.entries(receiver_approvals));
        refund_approved_account_ids(receiver_id, receiver_approvals);
      }
      if (approved_account_ids) {
        this.approvals_by_id.set(token_id, approved_account_ids);
      }
    }
    NonFungibleToken.emit_transfer(
      receiver_id,
      previous_owner_id,
      token_id,
      null,
      null
    );
    return false;
  }
}

export type StorageKey = TokensPerOwner | TokenPerOwnerInner;

export class TokensPerOwner implements IntoStorageKey {
  constructor(public account_hash: Bytes) {}

  into_storage_key(): Bytes {
    return "\x00" + this.account_hash;
  }
}

export class TokenPerOwnerInner implements IntoStorageKey {
  constructor(public account_id_hash: Bytes) {}

  into_storage_key(): Bytes {
    return "\x01" + this.account_id_hash;
  }
}
