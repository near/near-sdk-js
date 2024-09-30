import { AccountId, Balance } from "near-sdk-js";

/**
 * Provides token transfer resolve functionality.
 *
 * # Examples
 *
 * ```typescript
 * import { AccountId, Balance, call } from "near-sdk-js";
 * import {
    FungibleTokenCore,
    FungibleTokenResolver,
    FungibleToken,
 * } from "near-contract-standards/lib"
 *
 * @NearBindgen({ requireInit: false })
 * export class Contract implements FungibleTokenCore, FungibleTokenResolver {
 *     private token: FungibleToken;
 *
 *     constructor() {
 *         this.token = new FungibleToken();
 *     }
 *
 *     @call({ privateFunction: true })
 *     ft_resolve_transfer({
 *         sender_id,
 *         receiver_id,
 *         amount,
 *     }: {
 *         sender_id: AccountId,
 *         receiver_id: AccountId,
 *         amount: Balance
 *     }): Balance {
 *         const { used_amount, burned_amount } = this.token.internal_ft_resolve_transfer(sender_id, receiver_id, amount);
 *         if (burned_amount > 0) {
 *             console.log(`Account @${sender_id} burned ${burned_amount}`);
 *         }
 *         return used_amount;
 *     }
 * }
 * ```
 */
export interface FungibleTokenResolver {
   /**
   * Resolves the transfer of tokens between `sender_id` and `receiver_id`.
   *
   * @param sender_id - The account ID of the sender.
   * @param receiver_id - The account ID of the receiver.
   * @param amount - The amount of tokens to resolve in a decimal string representation.
   *
   * @returns The amount of tokens used during the transfer, returning the balance as a `Balance`.
   */
    ft_resolve_transfer({
        sender_id,
        receiver_id,
        amount,
    }: {
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: Balance,
    }): Balance;
}
