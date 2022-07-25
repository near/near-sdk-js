import {near, utils} from 'near-sdk-js'

export function bytes_for_approved_account_id(account_id) {
    // The extra 4 bytes are coming from Borsh serialization to store the length of the string.
    return account_id.length + 4 + 8
}

export function refund_approved_account_ids_iter(account_id, approved_account_ids) {
    let storage_released = approved_account_ids.map(bytes_for_approved_account_id).reduce((a, b) => a + b)
    let promise_id = near.promiseBatchCreate(account_id)
    near.promiseBatchActionTransfer(promise_id, new BigInt(storage_released) * utils.storage_byte_cost())
    near.promiseReturn(promise_id)
}

export function refund_deposit_to_account(storage_used, account_id) {
    let required_cost = utils.storage_byte_cost() * storage_used;
    let attached_deposit = near.attachedDeposit();

    utils.assert(
        required_cost <= attached_deposit,
        `Must attach ${required_cost} yoctoNEAR to cover storage`
    );

    let refund = attached_deposit - required_cost;
    if (refund > 1n) {
        let promise_id = near.promiseBatchCreate(account_id)
        near.promiseBatchActionTransfer(refund)
        near.promiseReturn(promise_id)    
    }
}