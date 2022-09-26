import { near } from 'near-sdk-js'

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

export function get_storage_usage() {
  near.valueReturn(near.storageUsage())
}

export function get_block_height() {
  near.valueReturn(near.blockHeight())
}

export function get_block_timestamp() {
  near.valueReturn(near.blockTimestamp())
}

export function get_epoch_height() {
  near.valueReturn(near.epochHeight())
}

export function get_attached_deposit() {
  near.valueReturn(near.attachedDeposit())
}

export function get_prepaid_gas() {
  near.valueReturn(near.prepaidGas())
}

export function get_used_gas() {
  near.valueReturn(near.usedGas())
}

export function get_random_seed() {
  near.valueReturn(near.randomSeed())
}

export function get_validator_stake() {
  near.valueReturn(near.validatorStake(near.signerAccountId()))
}

export function get_total_stake() {
  near.valueReturn(near.validatorTotalStake())
}
