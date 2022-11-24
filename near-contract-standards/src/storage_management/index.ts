import { AccountId } from "near-sdk-js"
import { Option } from "../non_fungible_token/utils"; 

export class StorageBalance {
    total: number;
    available: number;
}

export class StorageBalanceBounds {
    min: number;
    max: Option<number>;
}

export interface StorageManagement {
    /**
     * @param registration_only if `true` MUST refund above the minimum balance if the account didn't exist and
     *   refund full deposit if the account exists.
     */
    storage_deposit(
        account_id: Option<AccountId>,
        registration_only: Option<boolean>,
    ) : StorageBalance;

    /** Withdraw specified amount of available Ⓝ for predecessor account.
    *
    * This method is safe to call. It MUST NOT remove data.
    *
    * @param amount is sent as a string representing an unsigned 128-bit integer. If
    * omitted, contract MUST refund full `available` balance. If `amount` exceeds
    * predecessor account's available balance, contract MUST panic.
    *
    * If predecessor account not registered, contract MUST panic.
    *
    * MUST require exactly 1 yoctoNEAR attached balance to prevent restricted
    * function-call access-key call (UX wallet security)
    *
    * @returns the StorageBalance structure showing updated balances.
    */
    storage_withdraw(amount: Option<number>) : StorageBalance;

    /** Unregisters the predecessor account and returns the storage NEAR deposit back.
    *
    * If the predecessor account is not registered, the function MUST return `false` without panic.
    *
    * @param force If `force=true` the function SHOULD ignore account balances (burn them) and close the account.
    * Otherwise, MUST panic if caller has a positive registered balance (eg token holdings) or
    *     the contract doesn't support force unregistration.
    * MUST require exactly 1 yoctoNEAR attached balance to prevent restricted function-call access-key call
    * (UX wallet security)
    * @returns `true` if the account was unregistered, `false` if account was not registered before.
    */
    storage_unregister(force: Option<boolean>) : boolean;

    storage_balance_bounds() : StorageBalanceBounds;

    storage_balance_of(account_id: AccountId) : Option<StorageBalance>;
}
