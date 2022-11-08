import { PromiseOrValue } from "near-sdk-js/lib";
import { AccountId } from "near-sdk-js/lib/types";
import { TokenId } from "../token";
/** Approval receiver is the interface for the method called (or attempted to be called) when an NFT contract adds an approval for an account. */
export interface NonFungibleTokenApprovalReceiver {
    /** Respond to notification that contract has been granted approval for a token.
     *
     * Notes
     * - Contract knows the token contract ID from `predecessor_account_id`
     *
     * @param token_id - The token to which this contract has been granted approval
     * @param owner_id - The owner of the token
     * @param approval_id - The approval ID stored by NFT contract for this approval.
     *        Expected to be a number within the 2^53 limit representable by JSON.
     * @param msg: - specifies information needed by the approved contract in order to
              handle the approval. Can indicate both a function to call and the
              parameters to pass to that function.
    */
    nft_on_approve({ token_id, owner_id, approval_id, msg }: {
        token_id: TokenId;
        owner_id: AccountId;
        approval_id: bigint;
        msg: string;
    }): PromiseOrValue<string>;
}
