import { AccountId, PromiseOrValue } from "near-sdk-js";

/**
 * Provides token transfer resolve functionality.
 * 
 * # Examples
 *
 * ```typescript

 * import { AccountId, PromiseOrValue } from "near-sdk-js";
 * import { FungibleTokenCore, FungibleToken, FungibleTokenReceiver } from "near-contract-standards/lib"
 *
 * @NearBindgen({ requireInit: false })
 * export class Contract implements FungibleTokenCore, FungibleTokenReceiver {
 *     private token: FungibleToken;
 *
 *     constructor() {
 *         this.token = new FungibleToken();
 *     }
 *
 *     @call({})
 *    ft_on_transfer({ sender_id, amount, msg }: {
            sender_id: AccountId;
            amount: number;
            msg: String;
    }): PromiseOrValue<number> {
        return this.token.ft_on_transfer({ sender_id, amount, msg });
    };
 * }
 * ```
 */
export interface FungibleTokenReceiver {
    /**
     * Called by fungible token contract after `ft_transfer_call` was initiated by
     * `sender_id` of the given `amount` with the transfer message given in `msg` field.
     * The `amount` of tokens were already transferred to this contract account and ready to be used.
     *
     * The method must return the amount of tokens that are *not* used/accepted by this contract from the transferred
     * amount. Examples:
     * - The transferred amount was `500`, the contract completely takes it and must return `0`.
     * - The transferred amount was `500`, but this transfer call only needs `450` for the action passed in the `msg`
     *   field, then the method must return `50`.
     * - The transferred amount was `500`, but the action in `msg` field has expired and the transfer must be
     *   cancelled. The method must return `500` or panic.
     *
     * Arguments:
     * @param sender_id - the account ID that initiated the transfer.
     * @param amount - the amount of tokens that were transferred to this account in a decimal string representation.
     * @param msg - a string message that was passed with this transfer call.
     *
     * @returns the amount of unused tokens that should be returned to sender, in a decimal string representation.
     */
    ft_on_transfer({
        sender_id,
        amount,
        msg
    }: {
        sender_id: AccountId,
        amount: number,
        msg: String
    }
    ): PromiseOrValue<number>;
}
