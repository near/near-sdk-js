import { StorageBalance, StorageBalanceBounds } from "../storage_management";
import { FtBurn, FtTransfer } from "./events";
import { near, LookupMap, NearPromise, assert, } from "near-sdk-js";
// TODO: move to the main SDK package
import { assert_one_yocto } from "../non_fungible_token/utils";
const GAS_FOR_RESOLVE_TRANSFER = 5000000000000n;
const GAS_FOR_FT_TRANSFER_CALL = 25000000000000n + GAS_FOR_RESOLVE_TRANSFER;
const ERR_TOTAL_SUPPLY_OVERFLOW = "Total supply overflow";
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
export class FungibleToken {
    // TODO: constructor is used instead of new in Rust, check if it's ok. In NFT it's called init, why?.
    constructor(prefix) {
        const storage_prefix = prefix.into_storage_key();
        this.accounts = new LookupMap(storage_prefix);
        this.total_supply = 0n;
        this.account_storage_usage = 0n;
        this.measure_account_storage_usage();
    }
    measure_account_storage_usage() {
        let initial_storage_usage = near.storageUsage();
        let tmp_account_id = "a".repeat(64);
        this.accounts.set(tmp_account_id, 0n);
        this.account_storage_usage = near.storageUsage() - initial_storage_usage;
        this.accounts.remove(tmp_account_id);
    }
    internal_unwrap_balance_of(account_id) {
        let balance = this.accounts.get(account_id);
        if (balance === null) {
            throw Error(`The account ${account_id} is not registered`);
        }
        return balance;
    }
    internal_deposit(account_id, amount) {
        let balance = this.internal_unwrap_balance_of(account_id);
        let new_balance = balance + amount;
        if (!Number.isSafeInteger(new_balance)) {
            throw Error("Balance overflow");
        }
        this.accounts.set(account_id, new_balance);
        let new_total_supply = this.total_supply + amount;
        if (!Number.isSafeInteger(new_total_supply)) {
            throw Error(ERR_TOTAL_SUPPLY_OVERFLOW);
        }
        this.total_supply = new_total_supply;
    }
    internal_withdraw(account_id, amount) {
        let balance = this.internal_unwrap_balance_of(account_id);
        let new_balance = balance - amount;
        // TODO: is it the right check?
        if (!Number.isSafeInteger(new_balance)) {
            this.accounts.set(account_id, new_balance);
            let new_total_supply = this.total_supply - amount;
            if (!Number.isSafeInteger(new_total_supply)) {
                throw Error(ERR_TOTAL_SUPPLY_OVERFLOW);
            }
            this.total_supply = new_total_supply;
        }
        else {
            throw Error("The account doesn't have enough balance");
        }
    }
    internal_transfer(sender_id, receiver_id, amount, memo) {
        assert(sender_id != receiver_id, "Sender and receiver should be different");
        assert(amount > 0, "The amount should be a positive number");
        this.internal_withdraw(sender_id, amount);
        this.internal_deposit(receiver_id, amount);
        new FtTransfer(sender_id, receiver_id, amount, memo).emit();
    }
    internal_register_account(account_id) {
        if (this.accounts.containsKey(account_id)) {
            throw Error("The account is already registered");
        }
        this.accounts.set(account_id, BigInt(0));
    }
    /** Internal method that returns the amount of burned tokens in a corner case when the sender
     * has deleted (unregistered) their account while the `ft_transfer_call` was still in flight.
     * Returns (Used token amount, Burned token amount)
     */
    internal_ft_resolve_transfer(sender_id, receiver_id, amount) {
        // Get the unused amount from the `ft_on_transfer` call result.
        let unused_amount;
        try {
            unused_amount = Math.min(amount, JSON.parse(near.promiseResult(0)));
        }
        catch (e) {
            if (e.include('Failed')) {
                unused_amount = amount;
            }
            else {
                throw e;
            }
        }
        if (unused_amount > 0) {
            let receiver_balance = this.accounts.get(receiver_id) ?? 0n;
            if (receiver_balance > BigInt(0)) {
                let refund_amount = Math.min(+receiver_balance, unused_amount);
                let new_receiver_balance = receiver_balance.valueOf() - BigInt(refund_amount);
                if (new_receiver_balance < 0n) {
                    throw Error("The receiver account doesn't have enough balance");
                }
                this.accounts.set(receiver_id, new_receiver_balance);
                let sender_balance = this.accounts.get(sender_id) ?? 0n;
                if (sender_balance) {
                    let new_sender_balance = sender_balance.valueOf() + BigInt(refund_amount);
                    this.accounts.set(sender_id, new_sender_balance);
                    new FtTransfer(receiver_id, sender_id, BigInt(refund_amount), "refund").emit();
                    let used_amount = BigInt(amount - refund_amount);
                    if (used_amount < 0n) {
                        throw Error(ERR_TOTAL_SUPPLY_OVERFLOW);
                    }
                    return [used_amount.valueOf(), 0n];
                }
                else {
                    const new_total_supply = this.total_supply - BigInt(refund_amount);
                    if (new_total_supply < 0) {
                        throw Error(ERR_TOTAL_SUPPLY_OVERFLOW);
                    }
                    this.total_supply = new_total_supply;
                    near.log("The account of the sender was deleted");
                    new FtBurn(receiver_id, refund_amount, "refund").emit();
                    return [BigInt(amount), BigInt(refund_amount)];
                }
            }
        }
        return [BigInt(amount), 0n];
    }
    /** Implementation of FungibleTokenCore */
    ft_transfer({ receiver_id, amount, memo }) {
        assert_one_yocto();
        let sender_id = near.predecessorAccountId();
        this.internal_transfer(sender_id, receiver_id, amount, memo);
    }
    ft_transfer_call({ receiver_id, amount, memo, msg }) {
        assert_one_yocto();
        assert(near.prepaidGas() > GAS_FOR_FT_TRANSFER_CALL, "More gas is required");
        let sender_id = near.predecessorAccountId();
        this.internal_transfer(sender_id, receiver_id, BigInt(amount), memo);
        let receiver_gas = near.prepaidGas() - GAS_FOR_FT_TRANSFER_CALL;
        if (receiver_gas < 0) {
            throw new Error("Prepaid gas overflow");
        }
        return NearPromise.new(receiver_id)
            .functionCall("ft_on_transfer", JSON.stringify({ sender_id, amount, msg }), BigInt(0), receiver_gas)
            .then(NearPromise.new(near.currentAccountId())
            .functionCall("ft_resolve_transfer", JSON.stringify({ sender_id, receiver_id, amount }), BigInt(0), GAS_FOR_RESOLVE_TRANSFER));
    }
    ft_total_supply() {
        return this.total_supply;
    }
    ft_balance_of({ account_id }) {
        return this.accounts.get(account_id) ?? BigInt(0);
    }
    /** Implementation of storage
     * Internal method that returns the Account ID and the balance in case the account was
     * unregistered.
     */
    internal_storage_unregister(force) {
        assert_one_yocto();
        let account_id = near.predecessorAccountId();
        let balance = this.accounts.get(account_id);
        if (balance) {
            if (balance == BigInt(0) || force) {
                this.accounts.remove(account_id);
                this.total_supply -= balance;
                NearPromise.new(account_id).transfer(this.storage_balance_bounds().min + BigInt(1));
                return [account_id, balance];
            }
            else {
                throw Error("Can't unregister the account with the positive balance without force");
            }
        }
        else {
            near.log(`The account ${account_id} is not registered`);
            return null;
        }
    }
    internal_storage_balance_of(account_id) {
        if (this.accounts.containsKey(account_id)) {
            return new StorageBalance(this.storage_balance_bounds().min, BigInt(0));
        }
        else {
            return null;
        }
    }
    /** Implementation of StorageManagement
     * @param registration_only doesn't affect the implementation for vanilla fungible token.
     */
    storage_deposit(account_id, registration_only) {
        let amount = near.attachedDeposit();
        account_id = account_id ?? near.predecessorAccountId();
        if (this.accounts.containsKey(account_id)) {
            near.log("The account is already registered, refunding the deposit");
            if (amount > 0) {
                NearPromise.new(near.predecessorAccountId()).transfer(amount);
            }
        }
        else {
            let min_balance = this.storage_balance_bounds().min;
            if (amount < min_balance) {
                throw Error("The attached deposit is less than the minimum storage balance");
            }
            this.internal_register_account(account_id);
            let refund = amount - min_balance;
            if (refund > 0) {
                NearPromise.new(near.predecessorAccountId()).transfer(refund);
            }
        }
        return this.internal_storage_balance_of(account_id);
    }
    /**
     * While storage_withdraw normally allows the caller to retrieve `available` balance, the basic
     * Fungible Token implementation sets storage_balance_bounds.min == storage_balance_bounds.max,
     * which means available balance will always be 0. So this implementation:
     * - panics if `amount > 0`
     * - never transfers Ⓝ to caller
     * - returns a `storage_balance` struct if `amount` is 0
     */
    storage_withdraw(amount) {
        assert_one_yocto();
        let predecessor_account_id = near.predecessorAccountId();
        const storage_balance = this.internal_storage_balance_of(predecessor_account_id);
        if (storage_balance) {
            if (amount && amount > 0) {
                throw Error("The amount is greater than the available storage balance");
            }
            return storage_balance;
        }
        else {
            throw Error(`The account ${predecessor_account_id} is not registered`);
        }
    }
    storage_unregister(force) {
        return this.internal_storage_unregister(force) ? true : false;
    }
    storage_balance_bounds() {
        let required_storage_balance = BigInt(this.account_storage_usage) * near.storageByteCost();
        return new StorageBalanceBounds(required_storage_balance, required_storage_balance);
    }
    storage_balance_of(account_id) {
        return this.internal_storage_balance_of(account_id);
    }
    /** Implementation of FungibleTokenResolver */
    ft_resolve_transfer({ sender_id, receiver_id, amount }) {
        return this.internal_ft_resolve_transfer(sender_id, receiver_id, amount)[0];
    }
}
