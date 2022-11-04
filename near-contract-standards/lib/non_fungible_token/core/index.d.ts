import { AccountId } from "near-sdk-js/lib/types";
import { Token, TokenId } from "../token";
import { Option } from "../utils";
/** Used for all non-fungible tokens. The specification for the
 * [core non-fungible token standard] lays out the reasoning for each method.
 * It's important to check out [NonFungibleTokenReceiver](./receiver.ts)
 * and [NonFungibleTokenResolver](./resolver.ts) to
 * understand how the cross-contract call work.
 *
 * [core non-fungible token standard]: <https://nomicon.io/Standards/NonFungibleToken/Core.html>
 */
export interface NonFungibleTokenCore {
    /** Simple transfer. Transfer a given `token_id` from current owner to
     * `receiver_id`.
     *
     * Requirements
     * - Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
     * - Contract MUST panic if called by someone other than token owner or,
     *   if using Approval Management, one of the approved accounts
     * - `approval_id` is for use with Approval Management,
     *   see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
     * - If using Approval Management, contract MUST nullify approved accounts on
     *   successful transfer.
     * - TODO: needed? Both accounts must be registered with the contract for transfer to
     *   succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
     *
     * @param receiver_id - The valid NEAR account receiving the token
     * @param token_id - The token to transfer
     * @param approval_id - Expected approval ID. A number smaller than
     *        2^53, and therefore representable as JSON. See Approval Management
     *        standard for full explanation.
     * @param memo (optional) - For use cases that may benefit from indexing or
     *        providing information for a transfer
     */
    nft_transfer([receiver_id, token_id, approval_id, memo]: [
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<bigint>,
        memo: Option<string>
    ]): any;
    /** Transfer token and call a method on a receiver contract. A successful
     * workflow will end in a success execution outcome to the callback on the NFT
     * contract at the method `nft_resolve_transfer`.
     *
     * You can think of this as being similar to attaching native NEAR tokens to a
     * function call. It allows you to attach any Non-Fungible Token in a call to a
     * receiver contract.
     *
     * Requirements:
     * - Caller of the method must attach a deposit of 1 yoctoⓃ for security
     *   purposes
     * - Contract MUST panic if called by someone other than token owner or,
     *   if using Approval Management, one of the approved accounts
     * - The receiving contract must implement `ft_on_transfer` according to the
     *   standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
     *   with the resulting failed cross-contract call and roll back the transfer.
     * - Contract MUST implement the behavior described in `ft_resolve_transfer`
     * - `approval_id` is for use with Approval Management extension, see
     *   that document for full explanation.
     * - If using Approval Management, contract MUST nullify approved accounts on
     *   successful transfer.
     *
     * @param receiver_id - The valid NEAR account receiving the token.
     * @param token_id - The token to send.
     * @param approval_id - Expected approval ID. A number smaller than
     *        2^53, and therefore representable as JSON. See Approval Management
     *        standard for full explanation.
     * @param memo (optional) - For use cases that may benefit from indexing or
     *        providing information for a transfer.
     * @param msg - Specifies information needed by the receiving contract in
     *        order to properly handle the transfer. Can indicate both a function to
     *        call and the parameters to pass to that function.
     */
    nft_transfer_call([receiver_id, token_id, approval_id, memo]: [
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<bigint>,
        memo: Option<string>,
        msg: string
    ]): any;
    /** Returns the token with the given `token_id` or `null` if no such token. */
    nft_token(token_id: TokenId): Option<Token>;
}
