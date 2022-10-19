import { AccountId } from "../../../../lib/types";
import { TokenId } from "../token";
import { Option } from "../utils";

export interface NonFungibleTokenResolver {
  nft_resolve_transfer(
    previous_owner_id: AccountId,
    receiver_id: AccountId,
    token_id: TokenId,
    approvals: Option<{ [approval: string]: bigint }>
  ): boolean;
}
