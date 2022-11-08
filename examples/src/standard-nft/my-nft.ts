import { NonFungibleToken } from "near-contract-standards/lib";
import {
  assert,
  Bytes,
  call,
  initialize,
  near,
  NearBindgen,
  NearPromise,
  PromiseOrValue,
  view,
} from "near-sdk-js/lib";
import {
  NFTContractMetadata,
  NonFungibleTokenMetadataProvider,
  TokenMetadata,
} from "near-contract-standards/lib/non_fungible_token/metadata";
import {
  IntoStorageKey,
  Option,
} from "near-contract-standards/lib/non_fungible_token/utils";
import { AccountId } from "near-sdk-js/lib/types";
import { NonFungibleTokenCore } from "near-contract-standards/lib/non_fungible_token/core";
import {
  Token,
  TokenId,
} from "near-contract-standards/lib/non_fungible_token/token";
import { NonFungibleTokenResolver } from "near-contract-standards/lib/non_fungible_token/core/resolver";
import { NonFungibleTokenApproval } from "near-contract-standards/lib/non_fungible_token/approval";
import { NonFungibleTokenEnumeration } from "near-contract-standards/lib/non_fungible_token/enumeration";

class StorageKey {}

class StorageKeyNonFungibleToken extends StorageKey implements IntoStorageKey {
  into_storage_key(): Bytes {
    return "NFT_";
  }
}

class StorageKeyTokenMetadata extends StorageKey implements IntoStorageKey {
  into_storage_key(): Bytes {
    return "TOKEN_METADATA_";
  }
}

class StorageKeyTokenEnumeration extends StorageKey implements IntoStorageKey {
  into_storage_key(): Bytes {
    return "TOKEN_ENUMERATION_";
  }
}

class StorageKeyApproval extends StorageKey implements IntoStorageKey {
  into_storage_key(): Bytes {
    return "APPROVAL1_";
  }
}

@NearBindgen({ requireInit: true })
export class MyNFT
  implements
    NonFungibleTokenCore,
    NonFungibleTokenMetadataProvider,
    NonFungibleTokenResolver,
    NonFungibleTokenApproval,
    NonFungibleTokenEnumeration
{
  tokens: NonFungibleToken;
  metadata: Option<NFTContractMetadata>;

  constructor() {
    this.tokens = new NonFungibleToken();
    this.metadata = new NFTContractMetadata();
  }

  @view({})
  nft_total_supply(): number {
    return this.tokens.nft_total_supply();
  }

  @view({})
  nft_tokens({
    from_index,
    limit,
  }: {
    from_index: number;
    limit: number;
  }): Token[] {
    return this.tokens.nft_tokens({ from_index, limit });
  }

  @view({})
  nft_supply_for_owner({ account_id }: { account_id: string }): number {
    return this.tokens.nft_supply_for_owner({ account_id });
  }

  @view({})
  nft_tokens_for_owner({
    account_id,
    from_index,
    limit,
  }: {
    account_id: string;
    from_index: number;
    limit: number;
  }): Token[] {
    return this.tokens.nft_tokens_for_owner({ account_id, from_index, limit });
  }

  @call({ payableFunction: true })
  nft_approve({
    token_id,
    account_id,
    msg,
  }: {
    token_id: string;
    account_id: string;
    msg: string;
  }): Option<NearPromise> {
    return this.tokens.nft_approve({ token_id, account_id, msg });
  }

  @call({ payableFunction: true })
  nft_revoke({
    token_id,
    account_id,
  }: {
    token_id: string;
    account_id: string;
  }) {
    return this.tokens.nft_revoke({ token_id, account_id });
  }

  @call({ payableFunction: true })
  nft_revoke_all({ token_id }: { token_id: string }) {
    return this.tokens.nft_revoke_all({ token_id });
  }

  @view({})
  nft_is_approved({
    token_id,
    approved_account_id,
    approval_id,
  }: {
    token_id: string;
    approved_account_id: string;
    approval_id: bigint;
  }): boolean {
    return this.tokens.nft_is_approved({
      token_id,
      approved_account_id,
      approval_id,
    });
  }

  @call({})
  nft_resolve_transfer({
    previous_owner_id,
    receiver_id,
    token_id,
    approved_account_ids,
  }: {
    previous_owner_id: string;
    receiver_id: string;
    token_id: string;
    approved_account_ids: { [approval: string]: bigint };
  }): boolean {
    return this.tokens.nft_resolve_transfer({
      previous_owner_id,
      receiver_id,
      token_id,
      approved_account_ids,
    });
  }

  @view({})
  nft_metadata(): NFTContractMetadata {
    assert(this.metadata !== null, "Metadata not initialized");
    return this.metadata;
  }

  @call({ payableFunction: true })
  nft_transfer({
    receiver_id,
    token_id,
    approval_id,
    memo,
  }: {
    receiver_id: string;
    token_id: string;
    approval_id: bigint;
    memo: string;
  }) {
    this.tokens.nft_transfer({ receiver_id, token_id, approval_id, memo });
  }

  @call({ payableFunction: true })
  nft_transfer_call({
    receiver_id,
    token_id,
    approval_id,
    memo,
    msg,
  }: {
    receiver_id: string;
    token_id: string;
    approval_id: bigint;
    memo: string;
    msg: string;
  }): PromiseOrValue<boolean> {
    return this.tokens.nft_transfer_call({
      receiver_id,
      token_id,
      approval_id,
      memo,
      msg,
    });
  }

  @view({})
  nft_token({ token_id }: { token_id: string }): Option<Token> {
    return this.tokens.nft_token({ token_id });
  }

  @initialize({ requireInit: true })
  init({
    owner_id,
    metadata,
  }: {
    owner_id: string;
    metadata: NFTContractMetadata;
  }) {
    this.metadata = Object.assign(new NFTContractMetadata(), metadata);
    this.metadata.assert_valid();
    this.tokens = new NonFungibleToken();
    this.tokens.init(
      new StorageKeyNonFungibleToken(),
      owner_id,
      new StorageKeyTokenMetadata(),
      new StorageKeyTokenEnumeration(),
      new StorageKeyApproval()
    );
  }

  @call({ payableFunction: true })
  nft_mint({
    token_id,
    token_owner_id,
    token_metadata,
  }: {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
  }) {
    assert(
      near.predecessorAccountId() === this.tokens.owner_id,
      "Unauthorized"
    );
    this.tokens.internal_mint(token_id, token_owner_id, token_metadata);
  }
}
