import {near} from 'near-sdk-js'

export function get_current_account_id() {
    near.valueReturn(near.currentAccountId())
}

export function get_signer_account_id() {
    near.valueReturn(near.signerAccountId())
}

export function get_predecessor_account_id() {
    near.valueReturn(near.predecessorAccountId())
}

export function get_signer_account_pk() {
    near.valueReturn(near.signerAccountPk())
}

export function get_input() {
    near.valueReturn(near.input())
}

