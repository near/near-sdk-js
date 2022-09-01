import { Bytes, bytesToU8Array, u8ArrayToLatin1 } from "./utils";
import { PromiseResult } from "./types";

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;

// Interface available in QuickJS
interface Env {
  log: (msg: string) => void;
  signer_account_id: (register_id: number | bigint) => void;
  signer_account_pk: (register_id: number | bigint) => void;
  read_register: (register_id: number | bigint) => Uint8Array;
  predecessor_account_id: (register_id: number | bigint) => void;
  block_index: () => bigint;
  block_timestamp: () => bigint;
  epoch_height: () => bigint;
  attached_deposit: () => bigint;
  prepaid_gas: () => bigint;
  used_gas: () => bigint;
  random_seed: (register_id: number | bigint) => void;
  sha256: (value: Uint8Array, register_id: number | bigint) => void;
  keccak256: (value: Uint8Array, register_id: number | bigint) => void;
  keccak512: (value: Uint8Array, register_id: number | bigint) => void;
  ripemd160: (value: Uint8Array, read_register: number | bigint) => void;
  ecrecover: (hash: Uint8Array, sig: Uint8Array, v: number, malleabilityFlag: number, register_id: number | bigint) => bigint;
  panic_utf8: (msg: Uint8Array) => never;
  log_utf8: (msg: Uint8Array) => void;
  log_utf16: (msg: Uint8Array) => void;
  storage_read: (key: Uint8Array, register_id: number | bigint) => bigint;
  storage_has_key: (key: Uint8Array) => bigint;
  validator_stake: (account_id: string) => bigint;
  validator_total_stake: () => bigint;
  alt_bn128_g1_multiexp: (value: Uint8Array, register_id: number | bigint) => void;
  alt_bn128_g1_sum: (value: Uint8Array, register_id: number | bigint) => void;
  alt_bn128_pairing_check: (value: Uint8Array) => bigint;
  current_account_id: (register_id: number | bigint) => void;
  input: (register_id: number | bigint) => void;
  storage_usage: () => bigint;
  account_balance: () => bigint;
  account_locked_balance: () => bigint;
  value_return: (value: Uint8Array) => void;
  promise_create: (account_id: string, method_name: string, args: Uint8Array, amount: number | bigint, gas: number | bigint) => bigint;
  promise_then: (promise_index: number | bigint, account_id: string, method_name: string, args: Uint8Array, amount: number | bigint, gas: number | bigint) => bigint;
  promise_and: (...promise_index: number[] | bigint[]) => bigint;
  promise_batch_create: (account_id: string) => bigint;
  promise_batch_then: (promise_index: number | bigint, account_id: string) => bigint;
  promise_batch_action_create_account: (promise_index: number | bigint) => void;
  promise_batch_action_deploy_contract: (promise_index: number | bigint, code: Uint8Array) => void;
  promise_batch_action_function_call: (promise_index: number | bigint, method_name: string, args: Uint8Array, amount: number | bigint, gas: number | bigint) => void;
  promise_batch_action_transfer: (promise_index: number | bigint, amount: number | bigint) => void;
  promise_batch_action_stake: (promise_index: number | bigint, amount: number | bigint, public_key: Uint8Array) => void;
  promise_batch_action_add_key_with_full_access: (promise_index: number | bigint, public_key: Uint8Array, nonce: number | bigint) => void;
  promise_batch_action_add_key_with_function_call: (promise_index: number | bigint, public_key: Uint8Array, nonce: number | bigint, allowance: number | bigint, receiver_id: string, method_names: string) => void;
  promise_batch_action_delete_key: (promise_index: number | bigint, public_key: Uint8Array) => void;
  promise_batch_action_delete_account: (promise_index: number | bigint, beneficiary_id: string) => void;
  promise_batch_action_function_call_weight: (promise_index: number | bigint, method_names: string, args: Uint8Array, amount: number | bigint, gas: number | bigint, weight: number | bigint) => void;
  promise_results_count: () => bigint;
  promise_result: (promise_index: number | bigint, register_id: number | bigint) => bigint;
  promise_return: (promise_index: number | bigint) => void;
  storage_write: (key: Uint8Array, value: Uint8Array, register_id: number | bigint) => bigint;
  storage_remove: (key: Uint8Array, register_id: number | bigint) => bigint;
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
  return u8ArrayToLatin1(env.read_register(0));
}

export function signerAccountPk(): Uint8Array {
  env.signer_account_pk(0);
  return env.read_register(0);
}

export function predecessorAccountId(): string {
  env.predecessor_account_id(0);
  return u8ArrayToLatin1(env.read_register(0));
}

export function blockIndex(): bigint {
  return env.block_index();
}

export function blockHeight(): bigint {
  return blockIndex();
}

export function blockTimestamp(): bigint {
  return env.block_timestamp();
}

export function epochHeight(): bigint {
  return env.epoch_height();
}

export function attachedDeposit(): bigint {
  return env.attached_deposit();
}

export function prepaidGas(): bigint {
  return env.prepaid_gas();
}

export function usedGas(): bigint {
  return env.used_gas();
}

export function randomSeed(): Uint8Array {
  env.random_seed(0);
  return env.read_register(0);
}

export function sha256(value: Bytes): Uint8Array {
  value = bytesToU8Array(value)
  env.sha256(value, 0);
  return env.read_register(0);
}

export function keccak256(value: Bytes): Uint8Array {
  value = bytesToU8Array(value)
  env.keccak256(value, 0);
  return env.read_register(0);
}

export function keccak512(value: Bytes): Uint8Array {
  value = bytesToU8Array(value)
  env.keccak512(value, 0);
  return env.read_register(0);
}

export function ripemd160(value: Bytes): Uint8Array {
  value = bytesToU8Array(value)
  env.ripemd160(value, 0);
  return env.read_register(0);
}

export function ecrecover(
  hash: Bytes,
  sig: Bytes,
  v: number,
  malleabilityFlag: number
): Uint8Array | null {
  hash = bytesToU8Array(hash)
  sig = bytesToU8Array(sig)
  let ret = env.ecrecover(hash, sig, v, malleabilityFlag, 0);
  if (ret === 0n) {
    return null;
  }
  return env.read_register(0);
}

// NOTE: "env.panic(msg)" is not exported, use "throw Error(msg)" instead

export function panicUtf8(msg: Bytes): never {
  msg = bytesToU8Array(msg)
  env.panic_utf8(msg);
}

export function logUtf8(msg: Bytes) {
  msg = bytesToU8Array(msg)
  env.log_utf8(msg);
}

export function logUtf16(msg: Bytes) {
  msg = bytesToU8Array(msg)
  env.log_utf16(msg);
}

export function storageRead(key: Bytes): Uint8Array | null {
  key = bytesToU8Array(key)
  let ret = env.storage_read(key, 0);
  if (ret === 1n) {
    return env.read_register(0);
  } else {
    return null;
  }
}

export function storageHasKey(key: Bytes): boolean {
  key = bytesToU8Array(key)
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

export function validatorTotalStake(): bigint {
  return env.validator_total_stake();
}

export function altBn128G1Multiexp(value: Bytes): Uint8Array {
  value = bytesToU8Array(value)
  env.alt_bn128_g1_multiexp(value, 0);
  return env.read_register(0);
}

export function altBn128G1Sum(value: Bytes): Uint8Array {
  value = bytesToU8Array(value)
  env.alt_bn128_g1_sum(value, 0);
  return env.read_register(0);
}

export function altBn128PairingCheck(value: Bytes): boolean {
  value = bytesToU8Array(value)
  let ret = env.alt_bn128_pairing_check(value);
  if (ret === 1n) {
    return true;
  } else {
    return false;
  }
}

export function storageGetEvicted(): Uint8Array {
  return env.read_register(EVICTED_REGISTER);
}

export function currentAccountId(): string {
  env.current_account_id(0);
  return u8ArrayToLatin1(env.read_register(0));
}

export function input(): Uint8Array {
  env.input(0);
  return env.read_register(0);
}

export function storageUsage(): bigint {
  return env.storage_usage();
}

export function accountBalance(): bigint {
  return env.account_balance();
}

export function accountLockedBalance(): bigint {
  return env.account_locked_balance();
}

export function valueReturn(value: Bytes) {
  value = bytesToU8Array(value)
  env.value_return(value);
}

export function promiseCreate(
  accountId: string,
  methodName: string,
  args: Bytes,
  amount: number | bigint,
  gas: number | bigint
): bigint {
  args = bytesToU8Array(args)
  return env.promise_create(accountId, methodName, args, amount, gas);
}

export function promiseThen(
  promiseIndex: number | bigint,
  accountId: string,
  methodName: string,
  args: Bytes,
  amount: number | bigint,
  gas: number | bigint
) {
  args = bytesToU8Array(args)
  return env.promise_then(
    promiseIndex,
    accountId,
    methodName,
    args,
    amount,
    gas
  );
}

export function promiseAnd(...promiseIndex: number[] | bigint[]): bigint {
  return env.promise_and(...promiseIndex);
}

export function promiseBatchCreate(accountId: string): bigint {
  return env.promise_batch_create(accountId);
}

export function promiseBatchThen(
  promiseIndex: number | bigint,
  accountId: string
): bigint {
  return env.promise_batch_then(promiseIndex, accountId);
}

export function promiseBatchActionCreateAccount(promiseIndex: number | bigint) {
  env.promise_batch_action_create_account(promiseIndex);
}

export function promiseBatchActionDeployContract(
  promiseIndex: number | bigint,
  code: Bytes
) {
  code = bytesToU8Array(code)
  env.promise_batch_action_deploy_contract(promiseIndex, code);
}

export function promiseBatchActionFunctionCall(
  promiseIndex: number | bigint,
  methodName: string,
  args: Bytes,
  amount: number | bigint,
  gas: number | bigint
) {
  args = bytesToU8Array(args)
  env.promise_batch_action_function_call(
    promiseIndex,
    methodName,
    args,
    amount,
    gas
  );
}

export function promiseBatchActionTransfer(
  promiseIndex: number | bigint,
  amount: number | bigint
) {
  env.promise_batch_action_transfer(promiseIndex, amount);
}

export function promiseBatchActionStake(
  promiseIndex: number | bigint,
  amount: number | bigint,
  publicKey: Bytes
) {
  publicKey = bytesToU8Array(publicKey)
  env.promise_batch_action_stake(promiseIndex, amount, publicKey);
}

export function promiseBatchActionAddKeyWithFullAccess(
  promiseIndex: number | bigint,
  publicKey: Bytes,
  nonce: number | bigint
) {
  publicKey = bytesToU8Array(publicKey)
  env.promise_batch_action_add_key_with_full_access(
    promiseIndex,
    publicKey,
    nonce
  );
}

export function promiseBatchActionAddKeyWithFunctionCall(
  promiseIndex: number | bigint,
  publicKey: Bytes,
  nonce: number | bigint,
  allowance: number | bigint,
  receiverId: string,
  methodNames: string
) {
  publicKey = bytesToU8Array(publicKey)
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
  promiseIndex: number | bigint,
  publicKey: Bytes
) {
  publicKey = bytesToU8Array(publicKey)
  env.promise_batch_action_delete_key(promiseIndex, publicKey);
}

export function promiseBatchActionDeleteAccount(
  promiseIndex: number | bigint,
  beneficiaryId: string
) {
  env.promise_batch_action_delete_account(promiseIndex, beneficiaryId);
}

export function promiseBatchActionFunctionCallWeight(
  promiseIndex: number | bigint,
  methodName: string,
  args: Bytes,
  amount: number | bigint,
  gas: number | bigint,
  weight: number | bigint,
) {
  args = bytesToU8Array(args)
  env.promise_batch_action_function_call_weight(
    promiseIndex,
    methodName,
    args,
    amount,
    gas,
    weight
  );
}

export function promiseResultsCount(): bigint {
  return env.promise_results_count();
}

export function promiseResult(
  resultIdx: number | bigint
): Uint8Array | PromiseResult.NotReady | PromiseResult.Failed {
  let status: PromiseResult = Number(env.promise_result(resultIdx, 0));
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

export function promiseReturn(promiseIdx: number | bigint) {
  env.promise_return(promiseIdx);
}

export function storageWrite(key: Bytes, value: Bytes): boolean {
  key = bytesToU8Array(key)
  value = bytesToU8Array(value)
  let exist = env.storage_write(key, value, EVICTED_REGISTER);
  if (exist === 1n) {
    return true;
  }
  return false;
}

export function storageRemove(key: Bytes): boolean {
  key = bytesToU8Array(key)
  let exist = env.storage_remove(key, EVICTED_REGISTER);
  if (exist === 1n) {
    return true;
  }
  return false;
}

export function storageByteCost(): bigint {
  return 10_000_000_000_000_000_000n;
}
