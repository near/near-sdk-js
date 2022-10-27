import { PromiseOrValue } from "near-sdk-js/lib";
import { AccountId } from "near-sdk-js/lib/types";
import { TokenId } from "../token";

export interface NonFungibleTokenApprovalReceiver {
    nft_on_approve([token_id, owner_id, approval_id, msg]: [token_id: TokenId, owner_id: AccountId, approval_id: bigint, msg: string]): PromiseOrValue<string>;
}