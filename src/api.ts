import { Bytes } from "./utils";
import { PromiseResult } from "./types";

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;

// Interface available in QuickJS
interface Env {
  panic_utf8: (msg: string) => never;
  [x: string]: any;
}

declare let env: Env;

export function log(...params: any[]) {
  env.log(`${params
    .map(x => x === undefined ? 'undefined' : x)                // Stringify undefined
    .map(x => typeof (x) === 'object' ? JSON.stringify(x) : x)  // Convert Objects to strings
    .join(' ')}`                                                // Convert to string
  )
}

export function signerAccountId(): string {
  env.signer_account_id(0);
  return env.read_register(0);
}

export function signerAccountPk(): Bytes {
  env.signer_account_pk(0);
  return env.read_register(0);
}

export function predecessorAccountId(): string {
  env.predecessor_account_id(0);
  return env.read_register(0);
}

export function blockIndex(): BigInt {
  return env.block_index();
}

export function blockHeight(): BigInt {
  return blockIndex();
}

export function blockTimestamp(): BigInt {
  return env.block_timestamp();
}

export function epochHeight(): BigInt {
  return env.epoch_height();
}

export function attachedDeposit(): BigInt {
  return env.attached_deposit();
}

export function prepaidGas(): BigInt {
  return env.prepaid_gas();
}

export function usedGas(): BigInt {
  return env.used_gas();
}

export function randomSeed(): Bytes {
  env.random_seed(0);
  return env.read_register(0);
}

export function sha256(value: Bytes): Bytes {
  env.sha256(value, 0);
  return env.read_register(0);
}

export function keccak256(value: Bytes): Bytes {
  env.keccak256(value, 0);
  return env.read_register(0);
}

export function keccak512(value: Bytes): Bytes {
  env.keccak512(value, 0);
  return env.read_register(0);
}

export function ripemd160(value: Bytes): Bytes {
  env.ripemd160(value, 0);
  return env.read_register(0);
}

export function ecrecover(
  hash: Bytes,
  sig: Bytes,
  v: number,
  malleabilityFlag: number
): Bytes | null {
  let ret = env.ecrecover(hash, sig, v, malleabilityFlag, 0);
  if (ret === 0n) {
    return null;
  }
  return env.read_register(0);
}

// NOTE: "env.panic(msg)" is not exported, use "throw Error(msg)" instead

export function panicUtf8(msg: string): never {
  env.panic_utf8(msg);
}

export function logUtf8(msg: string) {
  env.log_utf8(msg);
}

export function logUtf16(msg: string) {
  env.log_utf16(msg);
}

export function storageRead(key: Bytes): Bytes | null {
  let ret = env.storage_read(key, 0);
  if (ret === 1n) {
    return env.read_register(0);
  } else {
    return null;
  }
}

export function storageHasKey(key: Bytes): boolean {
  let ret = env.storage_has_key(key);
  if (ret === 1n) {
    return true;
  } else {
    return false;
  }
}

export function validatorStake(accountId: string) {
  return env.validator_stake(accountId);
}

export function validatorTotalStake(): BigInt {
  return env.validator_total_stake();
}

export function altBn128G1Multiexp(value: Bytes): Bytes {
  env.alt_bn128_g1_multiexp(value, 0);
  return env.read_register(0);
}

export function altBn128G1Sum(value: Bytes): Bytes {
  env.alt_bn128_g1_sum(value, 0);
  return env.read_register(0);
}

export function altBn128PairingCheck(value: Bytes): boolean {
  let ret = env.alt_bn128_pairing_check(value);
  if (ret === 1n) {
    return true;
  } else {
    return false;
  }
}

export function storageGetEvicted(): Bytes {
  return env.read_register(EVICTED_REGISTER);
}

export function currentAccountId(): string {
  env.current_account_id(0);
  return env.read_register(0);
}

export function input(): Bytes {
  env.input(0);
  return env.read_register(0);
}

export function storageUsage(): BigInt {
  return env.storage_usage();
}

export function accountBalance(): BigInt {
  return env.account_balance();
}

export function accountLockedBalance(): BigInt {
  return env.account_locked_balance();
}

export function valueReturn(value: Bytes) {
  env.value_return(value);
}

export function promiseCreate(
  accountId: string,
  methodName: string,
  args: Bytes,
  amount: number | BigInt,
  gas: number | BigInt
): BigInt {
  return env.promise_create(accountId, methodName, args, amount, gas);
}

export function promiseThen(
  promiseIndex: number | BigInt,
  accountId: string,
  methodName: string,
  args: Bytes,
  amount: number | BigInt,
  gas: number | BigInt
) {
  return env.promise_then(
    promiseIndex,
    accountId,
    methodName,
    args,
    amount,
    gas
  );
}

export function promiseAnd(...promiseIndex: number[] | BigInt[]): BigInt {
  return env.promise_and(...promiseIndex);
}

export function promiseBatchCreate(accountId: string): BigInt {
  return env.promise_batch_create(accountId);
}

export function promiseBatchThen(
  promiseIndex: number | BigInt,
  accountId: string
): BigInt {
  return env.promise_batch_then(promiseIndex, accountId);
}

export function promiseBatchActionCreateAccount(promiseIndex: number | BigInt) {
  env.promise_batch_action_create_account(promiseIndex);
}

export function promiseBatchActionDeployContract(
  promiseIndex: number | BigInt,
  code: Bytes
) {
  env.promise_batch_action_deploy_contract(promiseIndex, code);
}

export function promiseBatchActionFunctionCall(
  promiseIndex: number | BigInt,
  methodName: string,
  args: Bytes,
  amount: number | BigInt,
  gas: number | BigInt
) {
  env.promise_batch_action_function_call(
    promiseIndex,
    methodName,
    args,
    amount,
    gas
  );
}

export function promiseBatchActionTransfer(
  promiseIndex: number | BigInt,
  amount: number | BigInt
) {
  env.promise_batch_action_transfer(promiseIndex, amount);
}

export function promiseBatchActionStake(
  promiseIndex: number | BigInt,
  amount: number | BigInt,
  publicKey: Bytes
) {
  env.promise_batch_action_stake(promiseIndex, amount, publicKey);
}

export function promiseBatchActionAddKeyWithFullAccess(
  promiseIndex: number | BigInt,
  publicKey: Bytes,
  nonce: number | BigInt
) {
  env.promise_batch_action_add_key_with_full_access(
    promiseIndex,
    publicKey,
    nonce
  );
}

export function promiseBatchActionAddKeyWithFunctionCall(
  promiseIndex: number | BigInt,
  publicKey: Bytes,
  nonce: number | BigInt,
  allowance: number | BigInt,
  receiverId: string,
  methodNames: string
) {
  env.promise_batch_action_add_key_with_function_call(
    promiseIndex,
    publicKey,
    nonce,
    allowance,
    receiverId,
    methodNames
  );
}

export function promiseBatchActionDeleteKey(
  promiseIndex: number | BigInt,
  publicKey: Bytes
) {
  env.promise_batch_action_delete_key(promiseIndex, publicKey);
}

export function promiseBatchActionDeleteAccount(
  promiseIndex: number | BigInt,
  beneficiaryId: string
) {
  env.promise_batch_action_delete_account(promiseIndex, beneficiaryId);
}

export function promiseResultsCount(): BigInt {
  return env.promise_results_count();
}

export function promiseResult(
  resultIdx: number | BigInt
): Bytes | PromiseResult.NotReady | PromiseResult.Failed {
  let status: PromiseResult = env.promise_result(resultIdx, 0);
  if (status == PromiseResult.Successful) {
    return env.read_register(0);
  } else if (
    status == PromiseResult.Failed ||
    status == PromiseResult.NotReady
  ) {
    return status;
  } else {
    throw Error(`Unexpected return code: ${status}`);
  }
}

export function promiseReturn(promiseIdx: number | BigInt) {
  env.promise_return(promiseIdx);
}

export function storageWrite(key: Bytes, value: Bytes): boolean {
  let exist = env.storage_write(key, value, EVICTED_REGISTER);
  if (exist === 1n) {
    return true;
  }
  return false;
}

export function storageRemove(key: Bytes): boolean {
  let exist = env.storage_remove(key, EVICTED_REGISTER);
  if (exist === 1n) {
    return true;
  }
  return false;
}

export function storageByteCost(): BigInt {
  return 10_000_000_000_000_000_000n;
}
