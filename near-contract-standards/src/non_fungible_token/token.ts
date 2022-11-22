import { TokenMetadata } from "./metadata";
import { AccountId } from "near-sdk-js";
import { Option } from "./utils";

/** Note that token IDs for NFTs are strings on NEAR. It's still fine to use autoincrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc. */
export type TokenId = string;

/** In this implementation, the Token struct takes two extensions standards (metadata and approval) as optional fields, as they are frequently used in modern NFTs. */
export class Token {
  constructor(
    public token_id: TokenId,
    public owner_id: AccountId,
    public metadata: Option<TokenMetadata>,
    public approved_account_ids: Option<{
      [approved_account_id: AccountId]: bigint;
    }>
  ) {}
}
