import { near, bytes } from "near-sdk-js";

export function get_current_account_id() {
  near.valueReturn(near.currentAccountId());
}

export function get_signer_account_id() {
  near.valueReturn(near.signerAccountId());
}

export function get_predecessor_account_id() {
  near.valueReturn(near.predecessorAccountId());
}

export function get_signer_account_pk() {
  near.valueReturnRaw(near.signerAccountPk());
}

export function get_input() {
  near.valueReturnRaw(near.inputRaw());
}

export function get_storage_usage() {
  near.valueReturn(near.storageUsage().toString());
}

export function get_block_height() {
  near.valueReturn(near.blockHeight().toString());
}

export function get_block_timestamp() {
  near.valueReturn(near.blockTimestamp().toString());
}

export function get_epoch_height() {
  near.valueReturn(near.epochHeight().toString());
}

export function get_attached_deposit() {
  near.valueReturn(JSON.stringify(near.attachedDeposit().toString()));
}

export function get_prepaid_gas() {
  near.valueReturn(near.prepaidGas().toString());
}

export function get_used_gas() {
  near.valueReturn(near.usedGas().toString());
}

export function get_random_seed() {
  near.valueReturnRaw(near.randomSeed());
}

export function get_validator_stake() {
  near.valueReturn(
    near.validatorStake(near.signerAccountId()).toString()
  );
}

export function get_total_stake() {
  near.valueReturn(near.validatorTotalStake().toString());
}
