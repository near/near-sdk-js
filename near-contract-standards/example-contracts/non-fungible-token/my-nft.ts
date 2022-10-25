import { NonFungibleToken } from "../../src/index";
import {
  assert,
  Bytes,
  call,
  initialize,
  near,
  NearBindgen,
  PromiseOrValue,
  view,
} from "near-sdk-js/lib/index";
import {
  NFTContractMetadata,
  NonFungibleTokenMetadataProvider,
  TokenMetadata,
} from "../../src/non_fungible_token/metadata";
import { IntoStorageKey, Option } from "../../src/non_fungible_token/utils";
import { AccountId } from "../../../lib/types";
import { NonFungibleTokenCore } from "../../src/non_fungible_token/core/core_impl";
import { Token, TokenId } from "../../src/non_fungible_token/token";
import { NonFungibleTokenResolver } from "../../src/non_fungible_token/core/resolver";

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
    return "APPROVAL_";
  }
}

@NearBindgen({ requireInit: true })
class MyNFT implements NonFungibleTokenCore, NonFungibleTokenMetadataProvider, NonFungibleTokenResolver {
  tokens: NonFungibleToken;
  metadata: Option<NFTContractMetadata>;

  constructor() {
    this.tokens = new NonFungibleToken();
    // @ts-ignore
    this.metadata = new NFTContractMetadata();
  }

  @call({})
  nft_resolve_transfer([previous_owner_id, receiver_id, token_id, approvals]: [previous_owner_id: string, receiver_id: string, token_id: string, approvals: { [approval: string]: bigint; }]): boolean {
    return this.tokens.nft_resolve_transfer([previous_owner_id, receiver_id, token_id, approvals])
  }

  @view({})
  nft_metadata(): NFTContractMetadata {
    assert(this.metadata !== null, "Metadata not initialized");
    return this.metadata;
  }

  @call({payableFunction: true})
  nft_transfer([receiver_id, token_id, approval_id, memo]: [
    receiver_id: string,
    token_id: string,
    approval_id: bigint,
    memo: string
  ]) {
    this.tokens.nft_transfer([receiver_id, token_id, approval_id, memo]);
  }

  @call({payableFunction: true})
  nft_transfer_call([receiver_id, token_id, approval_id, memo, msg]: [
    receiver_id: string,
    token_id: string,
    approval_id: bigint,
    memo: string,
    msg: string
  ]): PromiseOrValue<boolean> {
    return this.tokens.nft_transfer_call([
      receiver_id,
      token_id,
      approval_id,
      memo,
      msg
    ]);
  }

  @view({})
  nft_token(token_id: string): Option<Token> {
    return this.tokens.nft_token(token_id);
  }

  @initialize({ requireInit: true })
  init({
    owner_id,
    metadata,
  }: {
    owner_id: string;
    metadata: NFTContractMetadata;
  }) {
    // @ts-ignore
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
  nft_mint([
    token_id,
    token_owner_id,
    token_metadata,
  ]: [
    token_id: TokenId,
    token_owner_id: AccountId,
    token_metadata: TokenMetadata,
  ]) {
    assert(
      near.predecessorAccountId() === this.tokens.owner_id,
      "Unauthorized"
    );
    this.tokens.internal_mint(token_id, token_owner_id, token_metadata);
  }
}
