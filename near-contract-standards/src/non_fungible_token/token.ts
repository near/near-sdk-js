import { TokenMetadata } from "./metadata";
import { AccountId } from "near-sdk-js/lib/types";
import { Option } from "near-sdk-js/lib/utils";

export type TokenId = string;
export class Token {
  constructor(
    public token_id: TokenId,
    public owner_id: AccountId,
    public metadata: Option<TokenMetadata>,
    public approved_account_ids: Option<Map<AccountId, bigint>>
  ) {}
}
