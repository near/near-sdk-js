import { TokenMetadata } from "./metadata";
import { AccountId } from "near-sdk-js/lib/types";
import { Option } from "./utils";

export type TokenId = string;
export class Token {
  constructor(
    public token_id: TokenId,
    public owner_id: AccountId,
    public metadata: Option<TokenMetadata>,
    public approved_account_ids: Option<{
      [approved_account_id: string]: bigint;
    }>
  ) {}
}
