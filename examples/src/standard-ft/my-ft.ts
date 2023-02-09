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
    initialize,
    NearBindgen,
    IntoStorageKey,
} from "near-sdk-js";

import {
    Option,
} from "near-contract-standards/lib/non_fungible_token/utils"; // TODO: fix import

class FTPrefix implements IntoStorageKey {
    into_storage_key(): string {
        return "A"; // TODO: What is the best value to put here?
    }
}

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

    constructor() {
        this.token = undefined;
        this.metadata = undefined;
    }

    @initialize({})
    init({
        owner_id,
        total_supply,
        metadata,
    }: {
        owner_id: AccountId;
        total_supply: Balance;
        metadata: FungibleTokenMetadata;
    }) {
        metadata.assert_valid();
        this.token = new FungibleToken(new FTPrefix());
        this.metadata = metadata;

        this.token.internal_register_account(owner_id);
        this.token.internal_deposit(owner_id, total_supply);
    }

    @initialize({})
    init_with_default_meta({
        owner_id,
        total_supply
    }: {
        owner_id: AccountId;
        total_supply: Balance;
    }) {
        const metadata = new FungibleTokenMetadata(
            "ft-1.0.0",
            "Example NEAR fungible token",
            "EXAMPLE",
            "DATA_IMAGE_SVG_NEAR_ICON",
            null,
            null,
            24,
        );
        return this.init({
            owner_id,
            total_supply,
            metadata
        })
    }


    @call({})
    measure_account_storage_usage() {
        return this.token.measure_account_storage_usage();
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
        return this.token.ft_transfer({ receiver_id, amount, memo });
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
        return this.token.ft_transfer_call({ receiver_id, amount, memo, msg });
    }

    @view({})
    ft_total_supply(): Balance {
        return this.token.ft_total_supply();
    }

    @view({})
    ft_balance_of({ account_id }: { account_id: AccountId }): Balance {
        return this.token.ft_balance_of({ account_id });
    }

    /** Implementation of StorageManagement
     * @param registration_only doesn't affect the implementation for vanilla fungible token.
     */
    @call({})
    storage_deposit(
        {
            account_id,
            registration_only,
        }: {
            account_id?: AccountId,
            registration_only?: boolean,
        }
    ): StorageBalance {
        return this.token.storage_deposit({ account_id, registration_only });
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
    storage_withdraw({ amount }: { amount?: bigint }): StorageBalance {
        return this.token.storage_withdraw({ amount });
    }

    @call({})
    storage_unregister({ force }: { force?: boolean }): boolean {
        return this.token.storage_unregister({ force });
    }

    @view({})
    storage_balance_bounds(): StorageBalanceBounds {
        return this.token.storage_balance_bounds();
    }

    @view({})
    storage_balance_of({ account_id }: { account_id: AccountId }): Option<StorageBalance> {
        return this.token.storage_balance_of({ account_id });
    }

    @call({})
    ft_resolve_transfer({
        sender_id,
        receiver_id,
        amount
    }: {
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: Balance
    }): Balance {
        return this.token.ft_resolve_transfer({ sender_id, receiver_id, amount });
    }
}
