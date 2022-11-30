import { near, bytes } from "near-sdk-js";

export function get_current_account_id() {
  near.valueReturn(bytes(near.currentAccountId()));
}

export function get_signer_account_id() {
  near.valueReturn(bytes(near.signerAccountId()));
}

export function get_predecessor_account_id() {
  near.valueReturn(bytes(near.predecessorAccountId()));
}

export function get_signer_account_pk() {
  near.valueReturn(near.signerAccountPk());
}

export function get_input() {
  near.valueReturn(near.input());
}

export function get_storage_usage() {
  near.valueReturn(bytes(near.storageUsage().toString()));
}

export function get_block_height() {
  near.valueReturn(bytes(near.blockHeight().toString()));
}

export function get_block_timestamp() {
  near.valueReturn(bytes(near.blockTimestamp().toString()));
}

export function get_epoch_height() {
  near.valueReturn(bytes(near.epochHeight().toString()));
}

export function get_attached_deposit() {
  near.valueReturn(bytes(JSON.stringify(near.attachedDeposit().toString())));
}

export function get_prepaid_gas() {
  near.valueReturn(bytes(near.prepaidGas().toString()));
}

export function get_used_gas() {
  near.valueReturn(bytes(near.usedGas().toString()));
}

export function get_random_seed() {
  near.valueReturn(near.randomSeed());
}

export function get_validator_stake() {
  near.valueReturn(
    bytes(near.validatorStake(near.signerAccountId()).toString())
  );
}

export function get_total_stake() {
  near.valueReturn(bytes(near.validatorTotalStake().toString()));
}
