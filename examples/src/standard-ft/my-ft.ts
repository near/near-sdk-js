import {
    StorageBalance,
    StorageBalanceBounds,
    StorageManagement,
    FungibleTokenCore,
    FungibleTokenResolver,
    FungibleToken,
    FungibleTokenMetadata,
} from "near-contract-standards/lib"; //TODO: delete lib

import {
    AccountId,
    Balance,
    PromiseOrValue,
    call,
    view,
    NearBindgen,
} from "near-sdk-js";

import {
    Option,
} from "near-contract-standards/lib/non_fungible_token/utils"; // TODO: fix import

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
@NearBindgen({ requireInit: true })
export class MyFt implements FungibleTokenCore, StorageManagement, FungibleTokenResolver {
    token: FungibleToken;
    metadata: FungibleTokenMetadata;

    // TODO: constructor is used instead of new in Rust, check if it's ok. In NFT it's called init, why?.
    constructor() {
        this.token = new FungibleToken();
        this.metadata = new FungibleTokenMetadata();
    }


    @call({})
    measure_account_storage_usage() {

    }

    @view({})
    internal_unwrap_balance_of(account_id: AccountId): Balance {

    }

    /** Implementation of FungibleTokenCore */
    @call({})
    ft_transfer({
        receiver_id,
        amount,
        memo
    }: {
        receiver_id: AccountId,
        amount: Balance,
        memo?: String
    }) {

    }

    @call({})
    ft_transfer_call({
        receiver_id,
        amount,
        memo,
        msg
    }: {
        receiver_id: AccountId,
        amount: Balance,
        memo: Option<String>,
        msg: string
    }): PromiseOrValue<bigint> {

    }

    @view({})
    ft_total_supply(): Balance {
    }

    @view({})
    ft_balance_of({ account_id }: { account_id: AccountId }): Balance {
    }

    /** Implementation of StorageManagement
     * @param registration_only doesn't affect the implementation for vanilla fungible token.
     */
    @call({})
    storage_deposit(
        account_id?: AccountId,
        registration_only?: boolean,
    ): StorageBalance {

    }

    /**
     * While storage_withdraw normally allows the caller to retrieve `available` balance, the basic
     * Fungible Token implementation sets storage_balance_bounds.min == storage_balance_bounds.max,
     * which means available balance will always be 0. So this implementation:
     * - panics if `amount > 0`
     * - never transfers Ⓝ to caller
     * - returns a `storage_balance` struct if `amount` is 0
     */
    @view({})
    storage_withdraw(amount?: bigint): StorageBalance {

    }

    @call({})
    storage_unregister(force?: boolean): boolean {

    }

    @view({})
    storage_balance_bounds(): StorageBalanceBounds {

    }

    @view({})
    storage_balance_of(account_id: AccountId): Option<StorageBalance> {

    }

    @call({})
    ft_resolve_transfer({
        sender_id,
        receiver_id,
        amount
    }: {
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: number
    }): Balance {

    }
}
