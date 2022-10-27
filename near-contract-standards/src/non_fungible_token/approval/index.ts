import { AccountId } from "near-sdk-js/lib/types";
import { NearPromise } from "../../../../lib";
import { TokenId } from "../token";
import { Option } from "../utils";

export interface NonFungibleTokenApproval {
    nft_approve([token_id, account_id, msg]: [token_id: TokenId, account_id: AccountId, msg: Option<string>]): Option<NearPromise>;
    nft_revoke([token_id, account_id]: [token_id: TokenId, account_id: AccountId]);
    nft_revoke_all(token_id: TokenId);
    nft_is_approved([token_id, approved_account_id, approval_id]: [token_id: TokenId, approved_account_id: AccountId, approval_id: Option<bigint>]): boolean;
}
