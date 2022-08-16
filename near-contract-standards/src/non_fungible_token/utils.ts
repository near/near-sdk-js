import {near, assert, Bytes} from 'near-sdk-js'
import { AccountId } from 'near-sdk-js/lib/types'

export function bytes_for_approved_account_id(account_id: string): number {
    // The extra 4 bytes are coming from Borsh serialization to store the length of the string.
    return account_id.length + 4 + 8
}

export function refund_approved_account_ids_iter(account_id: string, approved_account_ids: string[]): void {
    let storage_released = approved_account_ids.map(bytes_for_approved_account_id).reduce((a, b) => a + b)
    let promise_id = near.promiseBatchCreate(account_id)
    near.promiseBatchActionTransfer(promise_id, BigInt(storage_released) * near.storageByteCost())
    near.promiseReturn(promise_id)
}

export function refund_approved_account_ids(account_id: AccountId, approved_account_ids: Map<AccountId, bigint>) {
    refund_approved_account_ids_iter(account_id, Array.from(approved_account_ids.keys()))
}

export function refund_deposit_to_account(storage_used: bigint, account_id: string): void {
    let required_cost = near.storageByteCost() * storage_used;
    let attached_deposit = near.attachedDeposit();

    assert(
        required_cost <= attached_deposit,
        `Must attach ${required_cost} yoctoNEAR to cover storage`
    );

    let refund = attached_deposit - required_cost;
    if (refund > 1n) {
        let promise_id = near.promiseBatchCreate(account_id)
        near.promiseBatchActionTransfer(promise_id, refund)
        near.promiseReturn(promise_id)
    }
}

export function refund_deposit(storage_used: bigint): void {
    refund_deposit_to_account(storage_used, near.predecessorAccountId())
}

export function hash_account_id(account_id: string): Bytes {
    return near.sha256(account_id)
}

export function assert_at_least_one_yocto(): void {
    assert(near.attachedDeposit() >= 1n, "Requires attached deposit of at least 1 yoctoNEAR")
}
