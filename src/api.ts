import { assert, Bytes, NearAmount, PromiseIndex, Register } from "./utils";
import { PromiseResult } from "./types";

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;

// Interface available in QuickJS
interface Env {
  panic_utf8(msg: string): never;
  log(message: string): void;
  log_utf8(message: string): void;
  log_utf16(message: string): void;
  read_register(register: Register): string;
  storage_read(key: string, register: Register): bigint;
  storage_has_key(key: string): bigint;
  storage_write(key: string, value: string, register: Register): bigint;
  storage_remove(key: string, register: Register): bigint;
  signer_account_id(register: Register): void;
  signer_account_pk(register: Register): void;
  predecessor_account_id(register: Register): void;
  current_account_id(register: Register): void;
  random_seed(register: Register): void;
  block_index(): bigint;
  block_timestamp(): bigint;
  epoch_height(): bigint;
  attached_deposit(): bigint;
  prepaid_gas(): bigint;
  used_gas(): bigint;
  sha256(value: string, register: Register): void;
  keccak256(value: string, register: Register): void;
  keccak512(value: string, register: Register): void;
  ripemd160(value: string, register: Register): void;
  ecrecover(
    hash: Bytes,
    sig: Bytes,
    v: number,
    malleabilityFlag: number,
    register: Register
  ): bigint;
  validator_stake(accountId: string): bigint;
  validator_total_stake(): bigint;
  alt_bn128_g1_multiexp(value: string, register: Register): void;
  alt_bn128_g1_sum(value: string, register: Register): void;
  alt_bn128_pairing_check(value: string): bigint;
  input(register: Register): void;
  storage_usage(): bigint;
  account_balance(): bigint;
  account_locked_balance(): bigint;
  value_return(value: string): void;
  promise_create(
    accountId: string,
    methodName: string,
    args: Bytes,
    amount: NearAmount,
    gas: NearAmount
  ): bigint;
  promise_then(
    promiseIndex: PromiseIndex,
    accountId: string,
    methodName: string,
    args: Bytes,
    amount: NearAmount,
    gas: NearAmount
  ): bigint;
  promise_and(...promiseIndexes: PromiseIndex[]): bigint;
  promise_batch_create(accountId: string): bigint;
  promise_batch_then(promiseIndex: PromiseIndex, accountId: string): bigint;
  promise_batch_action_create_account(promiseIndex: PromiseIndex): void;
  promise_batch_action_deploy_contract(
    promiseIndex: PromiseIndex,
    code: string
  ): void;
  promise_batch_action_function_call(
    promiseIndex: PromiseIndex,
    methodName: string,
    args: Bytes,
    amount: NearAmount,
    gas: NearAmount
  ): void;
  promise_batch_action_transfer(
    promiseIndex: PromiseIndex,
    amount: NearAmount
  ): void;
  promise_batch_action_stake(
    promiseIndex: PromiseIndex,
    amount: NearAmount,
    publicKey: Bytes
  ): void;
  promise_batch_action_add_key_with_full_access(
    promiseIndex: PromiseIndex,
    publicKey: Bytes,
    nonce: number | bigint
  ): void;
  promise_batch_action_add_key_with_function_call(
    promiseIndex: PromiseIndex,
    publicKey: Bytes,
    nonce: number | bigint,
    allowance: NearAmount,
    receiverId: string,
    methodNames: string
  ): void;
  promise_batch_action_delete_key(
    promiseIndex: PromiseIndex,
    publicKey: Bytes
  ): void;
  promise_batch_action_delete_account(
    promiseIndex: PromiseIndex,
    beneficiaryId: string
  ): void;
  promise_batch_action_function_call_weight(
    promiseIndex: PromiseIndex,
    methodName: string,
    args: Bytes,
    amount: NearAmount,
    gas: NearAmount,
    weight: number | bigint
  ): void;
  promise_results_count(): bigint;
  promise_result(promiseIndex: PromiseIndex, register: Register): PromiseResult;
  promise_return(promiseIndex: PromiseIndex): void;
}

declare let env: Env;

export function log(...params: unknown[]) {
  env.log(
    params
      .map((x) => (x === undefined ? "undefined" : x)) // Stringify undefined
      .map((x) => (typeof x === "object" ? JSON.stringify(x) : x)) // Convert Objects to strings
      .join(" ") // Convert to string
  );
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
  const returnValue = env.ecrecover(hash, sig, v, malleabilityFlag, 0);

  if (returnValue === 0n) {
    return null;
  }

  return env.read_register(0);
}

// NOTE: "env.panic(msg)" is not exported, use "throw Error(msg)" instead

export function panicUtf8(msg: Bytes): never {
  env.panic_utf8(msg);
}

export function logUtf8(msg: Bytes) {
  env.log_utf8(msg);
}

export function logUtf16(msg: Bytes) {
  env.log_utf16(msg);
}

export function storageRead(key: Bytes): Bytes | null {
  const returnValue = env.storage_read(key, 0);

  if (returnValue !== 1n) {
    return null;
  }

  return env.read_register(0);
}

export function storageHasKey(key: Bytes): boolean {
  return env.storage_has_key(key) === 1n;
}

export function validatorStake(accountId: string): bigint {
  return env.validator_stake(accountId);
}

export function validatorTotalStake(): bigint {
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
  return env.alt_bn128_pairing_check(value) === 1n;
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

export function storageUsage(): bigint {
  return env.storage_usage();
}

export function accountBalance(): bigint {
  return env.account_balance();
}

export function accountLockedBalance(): bigint {
  return env.account_locked_balance();
}

export function valueReturn(value: Bytes): void {
  env.value_return(value);
}

export function promiseCreate(
  accountId: string,
  methodName: string,
  args: Bytes,
  amount: NearAmount,
  gas: NearAmount
): bigint {
  return env.promise_create(accountId, methodName, args, amount, gas);
}

export function promiseThen(
  promiseIndex: PromiseIndex,
  accountId: string,
  methodName: string,
  args: Bytes,
  amount: NearAmount,
  gas: NearAmount
): bigint {
  return env.promise_then(
    promiseIndex,
    accountId,
    methodName,
    args,
    amount,
    gas
  );
}

export function promiseAnd(...promiseIndexes: PromiseIndex[]): bigint {
  return env.promise_and(...promiseIndexes);
}

export function promiseBatchCreate(accountId: string): bigint {
  return env.promise_batch_create(accountId);
}

export function promiseBatchThen(
  promiseIndex: PromiseIndex,
  accountId: string
): bigint {
  return env.promise_batch_then(promiseIndex, accountId);
}

export function promiseBatchActionCreateAccount(
  promiseIndex: PromiseIndex
): void {
  env.promise_batch_action_create_account(promiseIndex);
}

export function promiseBatchActionDeployContract(
  promiseIndex: PromiseIndex,
  code: Bytes
): void {
  env.promise_batch_action_deploy_contract(promiseIndex, code);
}

export function promiseBatchActionFunctionCall(
  promiseIndex: PromiseIndex,
  methodName: string,
  args: Bytes,
  amount: NearAmount,
  gas: NearAmount
): void {
  env.promise_batch_action_function_call(
    promiseIndex,
    methodName,
    args,
    amount,
    gas
  );
}

export function promiseBatchActionTransfer(
  promiseIndex: PromiseIndex,
  amount: NearAmount
): void {
  env.promise_batch_action_transfer(promiseIndex, amount);
}

export function promiseBatchActionStake(
  promiseIndex: PromiseIndex,
  amount: NearAmount,
  publicKey: Bytes
): void {
  env.promise_batch_action_stake(promiseIndex, amount, publicKey);
}

export function promiseBatchActionAddKeyWithFullAccess(
  promiseIndex: PromiseIndex,
  publicKey: Bytes,
  nonce: number | bigint
): void {
  env.promise_batch_action_add_key_with_full_access(
    promiseIndex,
    publicKey,
    nonce
  );
}

export function promiseBatchActionAddKeyWithFunctionCall(
  promiseIndex: PromiseIndex,
  publicKey: Bytes,
  nonce: number | bigint,
  allowance: NearAmount,
  receiverId: string,
  methodNames: string
): void {
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
  promiseIndex: PromiseIndex,
  publicKey: Bytes
): void {
  env.promise_batch_action_delete_key(promiseIndex, publicKey);
}

export function promiseBatchActionDeleteAccount(
  promiseIndex: PromiseIndex,
  beneficiaryId: string
): void {
  env.promise_batch_action_delete_account(promiseIndex, beneficiaryId);
}

export function promiseBatchActionFunctionCallWeight(
  promiseIndex: PromiseIndex,
  methodName: string,
  args: Bytes,
  amount: NearAmount,
  gas: NearAmount,
  weight: number | bigint
): void {
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

export function promiseResult(promiseIndex: PromiseIndex): Bytes {
  const status = env.promise_result(promiseIndex, 0);

  assert(
    Number(status) === PromiseResult.Successful,
    `Promise result ${
      status == PromiseResult.Failed
        ? "Failed"
        : status == PromiseResult.NotReady
        ? "NotReady"
        : status
    }`
  );

  return env.read_register(0);
}

export function promiseReturn(promiseIndex: PromiseIndex): void {
  env.promise_return(promiseIndex);
}

export function storageWrite(key: Bytes, value: Bytes): boolean {
  return env.storage_write(key, value, EVICTED_REGISTER) === 1n;
}

export function storageRemove(key: Bytes): boolean {
  return env.storage_remove(key, EVICTED_REGISTER) === 1n;
}

export function storageByteCost(): bigint {
  return 10_000_000_000_000_000_000n;
}
