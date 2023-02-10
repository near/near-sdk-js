import { StorageBalance, StorageBalanceBounds, StorageManagement } from "../storage_management";
import { FungibleTokenCore } from "./core";
import { FungibleTokenResolver } from "./resolver";
import { AccountId, LookupMap, Balance, PromiseOrValue, StorageUsage, IntoStorageKey } from "near-sdk-js";
import { Option } from '../non_fungible_token/utils';
/** Implementation of a FungibleToken standard
 * Allows to include NEP-141 compatible token to any contract.
 * There are next traits that any contract may implement:
 *     - FungibleTokenCore -- interface with ft_transfer methods. FungibleToken provides methods for it.
 *     - FungibleTokenMetaData -- return metadata for the token in NEP-148, up to contract to implement.
 *     - StorageManager -- interface for NEP-145 for allocating storage per account. FungibleToken provides methods for it.
 *     - AccountRegistrar -- interface for an account to register and unregister
 *
 * For example usage, see examples/fungible-token/src/lib.rs.
 */
export declare class FungibleToken implements FungibleTokenCore, StorageManagement, FungibleTokenResolver {
    accounts: LookupMap<Balance>;
    total_supply: Balance;
    account_storage_usage: StorageUsage;
    constructor();
    init(prefix: IntoStorageKey): this;
    measure_account_storage_usage(): void;
    internal_unwrap_balance_of(account_id: AccountId): Balance;
    internal_deposit(account_id: AccountId, amount: Balance): void;
    internal_withdraw(account_id: AccountId, amount: Balance): void;
    internal_transfer(sender_id: AccountId, receiver_id: AccountId, amount: Balance, memo?: String): void;
    internal_register_account(account_id: AccountId): void;
    /** Internal method that returns the amount of burned tokens in a corner case when the sender
     * has deleted (unregistered) their account while the `ft_transfer_call` was still in flight.
     * Returns (Used token amount, Burned token amount)
     */
    internal_ft_resolve_transfer(sender_id: AccountId, receiver_id: AccountId, amount: Balance): [bigint, bigint];
    /** Implementation of FungibleTokenCore */
    ft_transfer({ receiver_id, amount, memo }: {
        receiver_id: AccountId;
        amount: Balance;
        memo?: String;
    }): void;
    ft_transfer_call({ receiver_id, amount, memo, msg }: {
        receiver_id: AccountId;
        amount: Balance;
        memo: Option<String>;
        msg: string;
    }): PromiseOrValue<bigint>;
    ft_total_supply(): Balance;
    ft_balance_of({ account_id }: {
        account_id: AccountId;
    }): Balance;
    /** Implementation of storage
     * Internal method that returns the Account ID and the balance in case the account was
     * unregistered.
     */
    internal_storage_unregister(force?: boolean): Option<[AccountId, Balance]>;
    internal_storage_balance_of(account_id: AccountId): Option<StorageBalance>;
    /** Implementation of StorageManagement
     * @param registration_only doesn't affect the implementation for vanilla fungible token.
     */
    storage_deposit({ account_id, registration_only, }: {
        account_id?: AccountId;
        registration_only?: boolean;
    }): StorageBalance;
    /**
     * While storage_withdraw normally allows the caller to retrieve `available` balance, the basic
     * Fungible Token implementation sets storage_balance_bounds.min == storage_balance_bounds.max,
     * which means available balance will always be 0. So this implementation:
     * - panics if `amount > 0`
     * - never transfers Ⓝ to caller
     * - returns a `storage_balance` struct if `amount` is 0
     */
    storage_withdraw({ amount }: {
        amount?: bigint;
    }): StorageBalance;
    storage_unregister({ force }: {
        force?: boolean;
    }): boolean;
    storage_balance_bounds(): StorageBalanceBounds;
    storage_balance_of({ account_id }: {
        account_id: AccountId;
    }): Option<StorageBalance>;
    /** Implementation of FungibleTokenResolver */
    ft_resolve_transfer({ sender_id, receiver_id, amount }: {
        sender_id: AccountId;
        receiver_id: AccountId;
        amount: Balance;
    }): Balance;
    bigIntMax: (...args: bigint[]) => bigint;
    bigIntMin: (...args: bigint[]) => bigint;
    static reconstruct(data: FungibleToken): FungibleToken;
}
