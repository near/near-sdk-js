import { AccountId, PromiseOrValue, Balance } from "near-sdk-js";
import { Option } from "../non_fungible_token/utils";
export interface FungibleTokenCore {
    /**
     * Transfers positive `amount` of tokens from the `near.predecessorAccountId()` to `receiver_id`.
     * Both accounts must be registered with the contract for transfer to succeed. (See [NEP-145](https://github.com/near/NEPs/discussions/145))
     * This method must to be able to accept attached deposits, and must not panic on attached deposit.
     * Exactly 1 yoctoNEAR must be attached.
     * See [the Security section](https://github.com/near/NEPs/issues/141#user-content-security) of the standard.
     *
     * Arguments:
     * @param receiver_id - the account ID of the receiver.
     * @param amount - the amount of tokens to transfer. Must be a positive number in decimal string representation.
     * @param memo - an optional string field in a free form to associate a memo with this transfer.
     */
    ft_transfer({ receiver_id, amount, memo }: {
        receiver_id: AccountId;
        amount: Balance;
        memo?: String;
    }): any;
    /**
     * Transfers positive `amount` of tokens from the `near.predecessorAccountId()` to `receiver_id` account. Then
     * calls `ft_on_transfer` method on `receiver_id` contract and attaches a callback to resolve this transfer.
     * `ft_on_transfer` method must return the amount of tokens unused by the receiver contract, the remaining tokens
     * must be refunded to the `predecessor_account_id` at the resolve transfer callback.
     *
     * Token contract must pass all the remaining unused gas to the `ft_on_transfer` call.
     *
     * Malicious or invalid behavior by the receiver's contract:
     * - If the receiver contract promise fails or returns invalid value, the full transfer amount must be refunded.
     * - If the receiver contract overspent the tokens, and the `receiver_id` balance is lower than the required refund
     * amount, the remaining balance must be refunded. See [the Security section](https://github.com/near/NEPs/issues/141#user-content-security) of the standard.
     *
     * Both accounts must be registered with the contract for transfer to succeed. (See #145)
     * This method must to be able to accept attached deposits, and must not panic on attached deposit. Exactly 1 yoctoNEAR must be attached. See [the Security
     * section](https://github.com/near/NEPs/issues/141#user-content-security) of the standard.
     *
     * Arguments:
     * @param receiver_id - the account ID of the receiver contract. This contract will be called.
     * @param amount - the amount of tokens to transfer. Must be a positive number in a decimal string representation.
     * @param memo - an optional string field in a free form to associate a memo with this transfer.
     * @param msg - a string message that will be passed to `ft_on_transfer` contract call.
     *
     * @returns a promise which will result in the amount of tokens withdrawn from sender's account.
     */
    ft_transfer_call({ receiver_id, amount, memo, msg }: {
        receiver_id: AccountId;
        amount: Balance;
        memo: Option<String>;
        msg: String;
    }): PromiseOrValue<bigint>;
    /** Returns the total supply of the token in a decimal string representation. */
    ft_total_supply(): Balance;
    /** Returns the balance of the account. If the account doesn't exist must returns `"0"`. */
    ft_balance_of({ account_id }: {
        account_id: AccountId;
    }): Balance;
}
