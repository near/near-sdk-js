import {
  UnorderedMap,
  LookupMap,
  Bytes,
  near,
  UnorderedSet,
  assert,
  NearPromise,
  bytes,
} from "near-sdk-js/lib";
import { PromiseResult } from "near-sdk-js/lib/types";
import { TokenMetadata } from "../metadata";
import {
  hash_account_id,
  refund_approved_account_ids,
  refund_deposit,
  refund_deposit_to_account,
  assert_at_least_one_yocto,
  IntoStorageKey,
  Option,
} from "../utils";
import { NftMint, NftTransfer } from "../events";
import { NonFungibleTokenResolver } from "./resolver";
import { AccountId } from "near-sdk-js/lib/types/index";
import { Token, TokenId } from "../token";

export interface NonFungibleTokenCore {
  nft_transfer([receiver_id, token_id, approval_id, memo]: [
    receiver_id: AccountId,
    token_id: TokenId,
    approval_id: Option<bigint>,
    memo: Option<string>
  ]);
  nft_transfer_call([receiver_id, token_id, approval_id, memo]: [
    receiver_id: AccountId,
    token_id: TokenId,
    approval_id: Option<bigint>,
    memo: Option<string>,
    msg: string
  ]);
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

  constructor() {
    this.owner_id = "";
    this.extra_storage_in_bytes_per_token = 0n;
    this.owner_by_id = new UnorderedMap("");
    this.token_metadata_by_id = null;
    this.tokens_per_owner = null;
    this.approvals_by_id = null;
    this.next_approval_id_by_id = null;
  }

  init(
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
    this.tokens_per_owner = new LookupMap(
      enumeration_prefix.into_storage_key()
    );
    this.approvals_by_id = approvals_by_id;
    this.next_approval_id_by_id = next_approval_id_by_id;
    this.measure_min_token_storage_cost();
  }

  static reconstruct(data: NonFungibleToken): NonFungibleToken {
    let ret = new NonFungibleToken();
    Object.assign(ret, data);
    ret.owner_by_id = UnorderedMap.reconstruct(ret.owner_by_id);
    if (ret.token_metadata_by_id) {
      ret.token_metadata_by_id = LookupMap.reconstruct(ret.token_metadata_by_id);
    }
    if (ret.tokens_per_owner) {
      ret.tokens_per_owner = LookupMap.reconstruct(ret.tokens_per_owner);
    }
    if (ret.approvals_by_id) {
      ret.approvals_by_id = LookupMap.reconstruct(ret.approvals_by_id);
    }
    if (ret.next_approval_id_by_id) {
      ret.next_approval_id_by_id = LookupMap.reconstruct(
        ret.next_approval_id_by_id
      );
    }
    return ret;
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
      let u = this.tokens_per_owner.remove(tmp_owner_id, {
        reconstructor: UnorderedSet.reconstruct,
      });
      u.remove(tmp_token_id);
    }
    if (this.token_metadata_by_id) {
      this.token_metadata_by_id.remove(tmp_token_id);
    }
    this.owner_by_id.remove(tmp_token_id);
  }

  internal_transfer_unguarded(token_id: string, from: string, to: string) {
    this.owner_by_id.set(token_id, to);

    if (this.tokens_per_owner) {
      const owner_tokens_set = this.tokens_per_owner.get(from, {
        reconstructor: UnorderedSet.reconstruct,
      });
      if (owner_tokens_set == null) {
        throw new Error("Unable to access tokens per owner in unguarded call.");
      }
      if (owner_tokens_set.isEmpty()) {
        this.tokens_per_owner.remove(from);
      } else {
        this.tokens_per_owner.set(from, owner_tokens_set);
      }

      let receiver_tokens_set = this.tokens_per_owner.get(to, {
        reconstructor: UnorderedSet.reconstruct,
      });
      if (receiver_tokens_set === null) {
        receiver_tokens_set = new UnorderedSet<string>(
          new TokensPerOwner(near.sha256(to)).into_storage_key()
        );
      }
      receiver_tokens_set.set(token_id);
      this.tokens_per_owner.set(to, receiver_tokens_set);
    }
  }

  internal_transfer(
    sender_id: string,
    receiver_id: string,
    token_id: string,
    approval_id: Option<bigint>,
    memo: Option<string>
  ): [string, { [approvals: string]: bigint } | null] {
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
    return [owner_id as string, approved_account_ids];
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
      let token_ids = this.tokens_per_owner.get(owner_id, {
        reconstructor: UnorderedSet.reconstruct,
      });
      if (token_ids === null) {
        token_ids = new UnorderedSet(new TokensPerOwner(near.sha256(owner_id)).into_storage_key())
      }
      token_ids.set(token_id);
      this.tokens_per_owner.set(owner_id, token_ids);
    }

    const approved_account_ids = this.approvals_by_id ? {} : null;
    if (initial_storage_usage) {
      const [id, storage_usage] = initial_storage_usage;
      refund_deposit_to_account(near.storageUsage() - storage_usage, id);
    }
    return new Token(token_id, owner_id, token_metadata, approved_account_ids);
  }

  nft_transfer([receiver_id, token_id, approval_id, memo]: [
    receiver_id: string,
    token_id: string,
    approval_id: Option<bigint>,
    memo: Option<string>
  ]) {
    assert_at_least_one_yocto();
    const sender_id = near.predecessorAccountId();
    this.internal_transfer(sender_id, receiver_id, token_id, approval_id, memo);
  }

  nft_transfer_call([receiver_id, token_id, approval_id, memo, msg]: [
    receiver_id: string,
    token_id: string,
    approval_id: Option<bigint>,
    memo: Option<string>,
    msg: string
  ]) {
    assert_at_least_one_yocto();
    assert(
      near.prepaidGas() > GAS_FOR_NFT_TRANSFER_CALL,
      "Not enough prepaid gas"
    );
    const sender_id = near.predecessorAccountId();
    const [old_owner, old_approvals] = this.internal_transfer(
      sender_id,
      receiver_id,
      token_id,
      approval_id,
      memo
    );

    let promise = NearPromise.new(receiver_id)
      .functionCall(
        "nft_on_transfer",
        bytes(
          JSON.stringify({
            sender_id,
            previous_owner_id: old_owner,
            token_id,
            msg,
          })
        ),
        0n,
        near.prepaidGas() - GAS_FOR_NFT_TRANSFER_CALL
      )
      .then(
        NearPromise.new(near.currentAccountId()).functionCall(
          "nft_resolve_transfer",
          bytes(
            JSON.stringify({
              previous_owner_id: old_owner,
              receiver_id,
              token_id,
              approvals: old_approvals,
            })
          ),
          0n,
          GAS_FOR_RESOLVE_TRANSFER
        )
      );
    return promise;
  }

  nft_token(token_id: string): Option<Token> {
    const owner_id = this.owner_by_id.get(token_id);
    if (owner_id == null) {
      return null;
    }
    const metadata = this.token_metadata_by_id?.get(token_id, {
      reconstructor: TokenMetadata.reconstruct,
    });
    const approved_account_ids = this.approvals_by_id?.get(token_id) as Option<{
      [approvals: string]: bigint;
    }>;
    return new Token(token_id, owner_id, metadata, approved_account_ids);
  }

  nft_resolve_transfer(
    previous_owner_id: string,
    receiver_id: string,
    token_id: string,
    approved_account_ids: Option<{ [approvals: string]: bigint }>
  ): boolean {
    let must_revert = false;
    let p: Bytes;
    try {
      p = near.promiseResult(0);
    } catch (e) {
      if (e.message.includes("Not Ready")) {
        throw new Error();
      } else {
        must_revert = true;
      }
    }
    if (!must_revert) {
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
      let receiver_approvals = this.approvals_by_id.get(token_id);
      if (receiver_approvals) {
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
