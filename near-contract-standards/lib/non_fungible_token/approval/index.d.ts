import { AccountId, NearPromise } from "near-sdk-js";
import { TokenId } from "../token";
import { Option } from "../utils";
/** Interface used when it's desired to have a non-fungible token that has a
 * traditional escrow or approval system. This allows Alice to allow Bob
 * to take only the token with the unique identifier "19" but not others.
 * It should be noted that in the [core non-fungible token standard] there
 * is a method to do "transfer and call" which may be preferred over using
 * an approval management standard in certain use cases.
 *
 * [approval management standard]: https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html
 * [core non-fungible token standard]: https://nomicon.io/Standards/NonFungibleToken/Core.html
 */
export interface NonFungibleTokenApproval {
    /** Add an approved account for a specific token.
     *
     * Requirements
     * - Caller of the method must attach a deposit of at least 1 yoctoⓃ for
     *   security purposes
     * - Contract MAY require caller to attach larger deposit, to cover cost of
     *   storing approver data
     * - Contract MUST panic if called by someone other than token owner
     * - Contract MUST panic if addition would cause `nft_revoke_all` to exceed
     *   single-block gas limit
     * - Contract MUST increment approval ID even if re-approving an account
     * - If successfully approved or if had already been approved, and if `msg` is
     *   present, contract MUST call `nft_on_approve` on `account_id`. See
     *   `nft_on_approve` description below for details.
     *
     * @param token_id - The token for which to add an approval
     * @param account_id - The account to add to `approvals`
     * @param msg - Optional string to be passed to `nft_on_approve`
     * @returns void, if no `msg` given. Otherwise, returns promise call to
     *          `nft_on_approve`, which can resolve with whatever it wants.
     */
    nft_approve({ token_id, account_id, msg, }: {
        token_id: TokenId;
        account_id: AccountId;
        msg: Option<string>;
    }): Option<NearPromise>;
    /** Revoke an approved account for a specific token.
     *
     * Requirements
     * - Caller of the method must attach a deposit of 1 yoctoⓃ for security
     *   purposes
     * - If contract requires >1yN deposit on `nft_approve`, contract
     *   MUST refund associated storage deposit when owner revokes approval
     * - Contract MUST panic if called by someone other than token owner
     *
     * @param token_id - The token for which to revoke an approval
     * @param account_id - The account to remove from `approvals`
     */
    nft_revoke({ token_id, account_id, }: {
        token_id: TokenId;
        account_id: AccountId;
    }): any;
    /** Revoke all approved accounts for a specific token.
     *
     * Requirements
     * - Caller of the method must attach a deposit of 1 yoctoⓃ for security
     *   purposes
     * - If contract requires >1yN deposit on `nft_approve`, contract
     *   MUST refund all associated storage deposit when owner revokes approvals
     * - Contract MUST panic if called by someone other than token owner
     *
     * @param token_id - The token with approvals to revoke
     */
    nft_revoke_all({ token_id }: {
        token_id: TokenId;
    }): any;
    /** Check if a token is approved for transfer by a given account, optionally
     * checking an approval_id
     *
     * @param token_id - The token for which to revoke an approval
     * @param approved_account_id - The account to check the existence of in `approvals`
     * @param approval_id - An optional approval ID to check against current approval ID for given account
     * @returns if `approval_id` given, `true` if `approved_account_id` is approved with given `approval_id`
     * otherwise, `true` if `approved_account_id` is in list of approved accounts
     */
    nft_is_approved({ token_id, approved_account_id, approval_id, }: {
        token_id: TokenId;
        approved_account_id: AccountId;
        approval_id: Option<bigint>;
    }): boolean;
}
