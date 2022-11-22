import { AccountId, PromiseOrValue } from "near-sdk-js";
import { TokenId } from "../token";
/** Used when an NFT is transferred using `nft_transfer_call`. This interface is implemented on the receiving contract, not on the NFT contract. */
export interface NonFungibleTokenReceiver {
    /** Take some action after receiving a non-fungible token
     *
     * Requirements:
     * - Contract MUST restrict calls to this function to a set of whitelisted NFT
     *   contracts
     *
     * @param sender_id - The sender of `nft_transfer_call`
     * @param previous_owner_id - The account that owned the NFT prior to it being
     *        transferred to this contract, which can differ from `sender_id` if using
     *        Approval Management extension
     * @param token_id - The `token_id` argument given to `nft_transfer_call`
     * @param msg - Information necessary for this contract to know how to process the
     *        request. This may include method names and/or arguments.
     *
     * @returns true if token should be returned to `sender_id`
     */
    nft_on_transfer({ sender_id, previous_owner_id, token_id, msg, }: {
        sender_id: AccountId;
        previous_owner_id: AccountId;
        token_id: TokenId;
        msg: string;
    }): PromiseOrValue<boolean>;
}
