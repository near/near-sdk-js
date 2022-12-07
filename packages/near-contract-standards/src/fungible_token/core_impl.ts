import {StorageBalance, StorageBalanceBounds, StorageManagement} from "../storage_management";
import { FungibleTokenCore } from "./core";
import { FtBurn, FtTransfer } from "./events";
import { FungibleTokenResolver } from "./resolver";
import {
    near,
    AccountId,
    LookupMap,
    Balance,
    Gas,
    PromiseOrValue,
    PromiseResult,
    StorageUsage,
    call,
    view,
    assert,
} from "near-sdk-js";

// TODO: move to the main SDK package
import { IntoStorageKey, assert_one_yocto } from "../non_fungible_token/utils";

const GAS_FOR_RESOLVE_TRANSFER: Gas = 5_000_000_000_000n;
const GAS_FOR_FT_TRANSFER_CALL: Gas = 25_000_000_000_000n + GAS_FOR_RESOLVE_TRANSFER;
const ERR_TOTAL_SUPPLY_OVERFLOW: string = "Total supply overflow";

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
class FungibleToken implements FungibleTokenCore, StorageManagement, FungibleTokenResolver {
    // AccountID -> Account balance.
    accounts: LookupMap<Balance>;

    // Total supply of the all token.
    total_supply: Balance;

    // The storage size in bytes for one account.
    account_storage_usage: StorageUsage;

    // TODO: constructor is used instead of new in Rust, check if it's ok. In NFT it's called init, why?.
    constructor(prefix: IntoStorageKey) {
        const storage_prefix = prefix.into_storage_key();
        this.accounts = new LookupMap<Balance>(storage_prefix);
        this.total_supply = 0n;
        this.account_storage_usage = 0n;
        this.measure_account_storage_usage();
    }


    @call({})
    measure_account_storage_usage() {
        let initial_storage_usage = near.storageUsage();
        let tmp_account_id = AccountId::new_unchecked("a".repeat(64));
        this.accounts.insert(&tmp_account_id, &0number);
        this.account_storage_usage = near.storageUsage() - initial_storage_usage;
        this.accounts.remove(tmp_account_id);
    }

    @view({})
    internal_unwrap_balance_of(account_id: AccountId) : Balance {
        match this.accounts.get(account_id) {
            Some(balance) => balance,
            None => {
                throw Error(`The account ${account_id} is not registered`);
            }
        }
    }

    internal_deposit(account_id: AccountId, amount: Balance) {
        let balance = this.internal_unwrap_balance_of(account_id);
        if let Some(new_balance) = balance.checked_add(amount) {
            this.accounts.insert(account_id, &new_balance);
            this.total_supply = self
                .total_supply
                .checked_add(amount)
                .unwrap_or_else(|| throw Error(ERR_TOTAL_SUPPLY_OVERFLOW));
        } else {
            throw Error("Balance overflow");
        }
    }

    internal_withdraw(account_id: AccountId, amount: Balance) {
        let balance = this.internal_unwrap_balance_of(account_id);
        if let Some(new_balance) = balance.checked_sub(amount) {
            this.accounts.insert(account_id, &new_balance);
            this.total_supply = self
                .total_supply
                .checked_sub(amount)
                .unwrap_or_else(|| throw Error(ERR_TOTAL_SUPPLY_OVERFLOW));
        } else {
            throw Error("The account doesn't have enough balance");
        }
    }

    internal_transfer(
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: Balance,
        memo: Option<String>,
    ) {
        assert(sender_id != receiver_id, "Sender and receiver should be different");
        assert(amount > 0, "The amount should be a positive number");
        this.internal_withdraw(sender_id, amount);
        this.internal_deposit(receiver_id, amount);
        FtTransfer {
            old_owner_id: sender_id,
            new_owner_id: receiver_id,
            amount: &number(amount),
            memo: memo.as_deref(),
        }
        .emit();
    }

    internal_register_account(account_id: AccountId) {
        if this.accounts.insert(account_id, &0).is_some() {
            throw Error("The account is already registered");
        }
    }

    /** Internal method that returns the amount of burned tokens in a corner case when the sender
     * has deleted (unregistered) their account while the `ft_transfer_call` was still in flight.
     * Returns (Used token amount, Burned token amount)
     */
    internal_ft_resolve_transfer(
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: number,
    ) : (number, number) {
        let amount: Balance = amount.into();

        // Get the unused amount from the `ft_on_transfer` call result.
        let unused_amount = match near.promiseResult(0) {
            PromiseResult::NotReady => near.abort(),
            PromiseResult::Successful(value) => {
                if let Ok(unused_amount) = near_sdk::serde_json::from_slice::<number>(&value) {
                    std::cmp::min(amount, unused_amount.0)
                } else {
                    amount
                }
            }
            PromiseResult::Failed => amount,
        };

        if unused_amount > 0 {
            let receiver_balance = this.accounts.get(&receiver_id).unwrap_or(0);
            if receiver_balance > 0 {
                let refund_amount = std::cmp::min(receiver_balance, unused_amount);
                if let Some(new_receiver_balance) = receiver_balance.checked_sub(refund_amount) {
                    this.accounts.insert(&receiver_id, &new_receiver_balance);
                } else {
                    throw Error("The receiver account doesn't have enough balance");
                }

                if let Some(sender_balance) = this.accounts.get(sender_id) {
                    if let Some(new_sender_balance) = sender_balance.checked_add(refund_amount) {
                        this.accounts.insert(sender_id, &new_sender_balance);
                    } else {
                        throw Error("Sender balance overflow");
                    }

                    FtTransfer {
                        old_owner_id: &receiver_id,
                        new_owner_id: sender_id,
                        amount: &number(refund_amount),
                        memo: Some("refund"),
                    }
                    .emit();
                    let used_amount = amount
                        .checked_sub(refund_amount)
                        .unwrap_or_else(|| throw Error(ERR_TOTAL_SUPPLY_OVERFLOW));
                    return (used_amount, 0);
                } else {
                    // Sender's account was deleted, so we need to burn tokens.
                    this.total_supply = self
                        .total_supply
                        .checked_sub(refund_amount)
                        .unwrap_or_else(|| throw Error(ERR_TOTAL_SUPPLY_OVERFLOW));
                    log!("The account of the sender was deleted");
                    FtBurn {
                        owner_id: &receiver_id,
                        amount: &number(refund_amount),
                        memo: Some("refund"),
                    }
                    .emit();
                    return (amount, refund_amount);
                }
            }
        }
        (amount, 0)
    }

    /** Implementation of FungibleTokenCore */
    @call({})
    ft_transfer(receiver_id: AccountId, amount: number, memo: Option<String>) {
        assert_one_yocto();
        let sender_id = near.predecessorAccountId();
        let amount: Balance = amount.into();
        this.internal_transfer(&sender_id, &receiver_id, amount, memo);
    }

    @call({})
    ft_transfer_call(
        receiver_id: AccountId,
        amount: number,
        memo: Option<String>,
        msg: String,
    ) : PromiseOrValue<number> {
        assert_one_yocto();
        assert(near.prepaidGas() > GAS_FOR_FT_TRANSFER_CALL, "More gas is required");
        let sender_id = near.predecessorAccountId();
        let amount: Balance = amount.into();
        this.internal_transfer(&sender_id, &receiver_id, amount, memo);
        let receiver_gas = near.prepaidGas()
            .0
            .checked_sub(GAS_FOR_FT_TRANSFER_CALL.0)
            .unwrap_or_else(|| throw Error("Prepaid gas overflow"));
        // Initiating receiver's call and the callback
        ext_ft_receiver::ext(receiver_id.clone())
            .with_static_gas(receiver_gas.into())
            .ft_on_transfer(sender_id.clone(), amount.into(), msg)
            .then(
                ext_ft_resolver::ext(near.currentAccountId())
                    .with_static_gas(GAS_FOR_RESOLVE_TRANSFER)
                    .ft_resolve_transfer(sender_id, receiver_id, amount.into()),
            )
            .into()
    }

    @view({})
    ft_total_supply() : number {
        this.total_supply.into()
    }

    @view({})
    ft_balance_of(account_id: AccountId) : number {
        this.accounts.get(&account_id).unwrap_or(0).into()
    }

    /** Implementation of storage
     * Internal method that returns the Account ID and the balance in case the account was
     * unregistered.
     */
    internal_storage_unregister(
        force: Option<bool>,
    ) : Option<(AccountId, Balance)> {
        assert_one_yocto();
        let account_id = near.predecessorAccountId();
        let force = force.unwrap_or(false);
        if let Some(balance) = this.accounts.get(&account_id) {
            if balance == 0 || force {
                this.accounts.remove(&account_id);
                this.total_supply -= balance;
                Promise::new(account_id.clone()).transfer(this.storage_balance_bounds().min.0 + 1);
                Some((account_id, balance))
            } else {
                throw Error("Can't unregister the account with the positive balance without force");
            }
        } else {
            near.log(`The account ${account_id} is not registered`);
            None
        }
    }

    @view({})
    internal_storage_balance_of(account_id: AccountId) -> Option<StorageBalance> {
        if this.accounts.contains_key(account_id) {
            Some(StorageBalance { total: this.storage_balance_bounds().min, available: 0.into() })
        } else {
            None
        }
    }

    /** Implementation of StorageManagement
     * @param registration_only doesn't affect the implementation for vanilla fungible token.
     */
    @call({})
    storage_deposit(
        account_id: Option<AccountId>,
        registration_only: Option<bool>,
    ) : StorageBalance {
        let amount: Balance = near.attachedDeposit();
        let account_id = account_id.unwrap_or_else(near.predecessorAccountId());
        if this.accounts.contains_key(&account_id) {
            log!("The account is already registered, refunding the deposit");
            if amount > 0 {
                Promise::new(near.predecessorAccountId()).transfer(amount);
            }
        } else {
            let min_balance = this.storage_balance_bounds().min.0;
            if amount < min_balance {
                throw Error("The attached deposit is less than the minimum storage balance");
            }

            this.internal_register_account(&account_id);
            let refund = amount - min_balance;
            if refund > 0 {
                Promise::new(near.predecessorAccountId()).transfer(refund);
            }
        }
        this.internal_storage_balance_of(&account_id).unwrap()
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
    storage_withdraw(amount: Option<number>) : StorageBalance {
        assert_one_yocto();
        let predecessor_account_id = near.predecessorAccountId();
        if let Some(storage_balance) = this.internal_storage_balance_of(&predecessor_account_id) {
            match amount {
                Some(amount) if amount.0 > 0 => {
                    throw Error("The amount is greater than the available storage balance");
                }
                _ => storage_balance,
            }
        } else {
            throw Error(`The account ${predecessor_account_id} is not registered`)
        }
    }

    @call({})
    storage_unregister(force: Option<bool>) : bool {
        this.internal_storage_unregister(force).is_some()
    }

    view({})
    storage_balance_bounds() : StorageBalanceBounds {
        let required_storage_balance =
            Balance::from(this.account_storage_usage) * near.storageByteCost();
        StorageBalanceBounds {
            min: required_storage_balance.into(),
            max: Some(required_storage_balance.into()),
        }
    }

    @view({})
    storage_balance_of(account_id: AccountId) : Option<StorageBalance> {
        this.internal_storage_balance_of(&account_id)
    }

    /** Implementation of FungibleTokenResolver */
    @call({})
    ft_resolve_transfer(
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: number,
    ) : number {
        return this.internal_ft_resolve_transfer(sender_id, receiver_id, amount);
    }
}
