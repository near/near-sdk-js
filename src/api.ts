import { assert, Bytes, NearAmount, PromiseIndex, Register } from "./utils";
import { GasWeight, PromiseResult } from "./types";

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;

// Interface available in QuickJS
interface Env {
  // Panic
  panic_utf8(message: Bytes): never;

  // Logging
  log(message: Bytes): void;
  log_utf8(message: Bytes): void;
  log_utf16(message: Bytes): void;

  // Read from register
  read_register(register: Register): string;

  // Storage
  storage_read(key: Bytes, register: Register): bigint;
  storage_has_key(key: Bytes): bigint;
  storage_write(key: Bytes, value: Bytes, register: Register): bigint;
  storage_remove(key: Bytes, register: Register): bigint;
  storage_usage(): bigint;

  // Caller methods
  signer_account_id(register: Register): void;
  signer_account_pk(register: Register): void;
  attached_deposit(): bigint;
  predecessor_account_id(register: Register): void;
  input(register: Register): void;

  // Account data
  account_balance(): bigint;
  account_locked_balance(): bigint;
  current_account_id(register: Register): void;
  validator_stake(accountId: Bytes): bigint;
  validator_total_stake(): bigint;

  // Blockchain info
  block_index(): bigint;
  block_timestamp(): bigint;
  epoch_height(): bigint;

  // Gas
  prepaid_gas(): bigint;
  used_gas(): bigint;

  // Helper methods and cryptography
  value_return(value: Bytes): void;
  random_seed(register: Register): void;
  sha256(value: Bytes, register: Register): void;
  keccak256(value: Bytes, register: Register): void;
  keccak512(value: Bytes, register: Register): void;
  ripemd160(value: Bytes, register: Register): void;
  ecrecover(
    hash: Bytes,
    sig: Bytes,
    v: number,
    malleabilityFlag: number,
    register: Register
  ): bigint;
  alt_bn128_g1_multiexp(value: Bytes, register: Register): void;
  alt_bn128_g1_sum(value: Bytes, register: Register): void;
  alt_bn128_pairing_check(value: Bytes): bigint;

  // Promises
  promise_create(
    accountId: Bytes,
    methodName: Bytes,
    args: Bytes,
    amount: NearAmount,
    gas: NearAmount
  ): bigint;
  promise_then(
    promiseIndex: PromiseIndex,
    accountId: Bytes,
    methodName: Bytes,
    args: Bytes,
    amount: NearAmount,
    gas: NearAmount
  ): bigint;
  promise_and(...promiseIndexes: PromiseIndex[]): bigint;
  promise_batch_create(accountId: Bytes): bigint;
  promise_batch_then(promiseIndex: PromiseIndex, accountId: Bytes): bigint;
  promise_batch_action_create_account(promiseIndex: PromiseIndex): void;
  promise_batch_action_deploy_contract(
    promiseIndex: PromiseIndex,
    code: Bytes
  ): void;
  promise_batch_action_function_call(
    promiseIndex: PromiseIndex,
    methodName: Bytes,
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
    receiverId: Bytes,
    methodNames: Bytes
  ): void;
  promise_batch_action_delete_key(
    promiseIndex: PromiseIndex,
    publicKey: Bytes
  ): void;
  promise_batch_action_delete_account(
    promiseIndex: PromiseIndex,
    beneficiaryId: Bytes
  ): void;
  promise_batch_action_function_call_weight(
    promiseIndex: PromiseIndex,
    methodName: Bytes,
    args: Bytes,
    amount: NearAmount,
    gas: NearAmount,
    weight: GasWeight
  ): void;
  promise_results_count(): bigint;
  promise_result(promiseIndex: PromiseIndex, register: Register): PromiseResult;
  promise_return(promiseIndex: PromiseIndex): void;
}

declare const env: Env;

/**
 * Logs parameters in the NEAR WASM virtual machine.
 *
 * @param params - Parameters to log.
 */
export function log(...params: unknown[]): void {
  env.log(
    params.reduce<string>((accumulated, parameter, index) => {
      // Stringify undefined
      const param = parameter === undefined ? "undefined" : parameter;
      // Convert Objects to strings and convert to string
      const stringified =
        typeof param === "object" ? JSON.stringify(param) : `${param}`;

      if (index === 0) {
        return stringified;
      }

      return `${accumulated} ${stringified}`;
    }, "")
  );
}

/**
 * Returns the account ID of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 */
export function signerAccountId(): Bytes {
  env.signer_account_id(0);
  return env.read_register(0);
}

/**
 * Returns the public key of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 */
export function signerAccountPk(): Bytes {
  env.signer_account_pk(0);
  return env.read_register(0);
}

/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 */
export function predecessorAccountId(): Bytes {
  env.predecessor_account_id(0);
  return env.read_register(0);
}

/**
 * Returns the account ID of the current contract - the contract that is being executed.
 */
export function currentAccountId(): Bytes {
  env.current_account_id(0);
  return env.read_register(0);
}

/**
 * Returns the current block index.
 */
export function blockIndex(): bigint {
  return env.block_index();
}

/**
 * Returns the current block height.
 */
export function blockHeight(): bigint {
  return blockIndex();
}

/**
 * Returns the current block timestamp.
 */
export function blockTimestamp(): bigint {
  return env.block_timestamp();
}

/**
 * Returns the current epoch height.
 */
export function epochHeight(): bigint {
  return env.epoch_height();
}

/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 */
export function attachedDeposit(): bigint {
  return env.attached_deposit();
}

/**
 * Returns the amount of Gas that was attached to this function call.
 */
export function prepaidGas(): bigint {
  return env.prepaid_gas();
}

/**
 * Returns the amount of Gas that has been used by this function call until now.
 */
export function usedGas(): bigint {
  return env.used_gas();
}

/**
 * Returns the current account's account balance.
 */
export function accountBalance(): bigint {
  return env.account_balance();
}

/**
 * Returns the current account's locked balance.
 */
export function accountLockedBalance(): bigint {
  return env.account_locked_balance();
}

/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
export function storageRead(key: Bytes): Bytes | null {
  const returnValue = env.storage_read(key, 0);

  if (returnValue !== 1n) {
    return null;
  }

  return env.read_register(0);
}

/**
 * Checks for the existance of a value under the provided key in NEAR storage.
 *
 * @param key - The key to check for in storage.
 */
export function storageHasKey(key: Bytes): boolean {
  return env.storage_has_key(key) === 1n;
}

/**
 * Get the last written or removed value from NEAR storage.
 */
export function storageGetEvicted(): Bytes {
  return env.read_register(EVICTED_REGISTER);
}

/**
 * Returns the current accounts NEAR storage usage.
 */
export function storageUsage(): bigint {
  return env.storage_usage();
}

/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
export function storageWrite(key: Bytes, value: Bytes): boolean {
  return env.storage_write(key, value, EVICTED_REGISTER) === 1n;
}

/**
 * Removes the value of the provided key from NEAR storage.
 *
 * @param key - The key to be removed.
 */
export function storageRemove(key: Bytes): boolean {
  return env.storage_remove(key, EVICTED_REGISTER) === 1n;
}

/**
 * Returns the cost of storing 0 Byte on NEAR storage.
 */
export function storageByteCost(): bigint {
  return 10_000_000_000_000_000_000n;
}

/**
 * Returns the arguments passed to the current smart contract call.
 */
export function input(): Bytes {
  env.input(0);
  return env.read_register(0);
}

/**
 * Returns the value from the NEAR WASM virtual machine.
 *
 * @param value - The value to return.
 */
export function valueReturn(value: Bytes): void {
  env.value_return(value);
}

/**
 * Returns a random string of bytes.
 */
export function randomSeed(): Bytes {
  env.random_seed(0);
  return env.read_register(0);
}

/**
 * Create a NEAR promise call to a contract on the blockchain.
 *
 * @param accountId - The account ID of the target contract.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR attached to the call.
 * @param gas - The amount of Gas attached to the call.
 */
export function promiseCreate(
  accountId: Bytes,
  methodName: Bytes,
  args: Bytes,
  amount: NearAmount,
  gas: NearAmount
): PromiseIndex {
  return env.promise_create(
    accountId,
    methodName,
    args,
    amount,
    gas
  ) as PromiseIndex;
}

/**
 * Attach a callback NEAR promise to be executed after a provided promise.
 *
 * @param promiseIndex - The promise after which to call the callback.
 * @param accountId - The account ID of the contract to perform the callback on.
 * @param methodName - The name of the method to call.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
export function promiseThen(
  promiseIndex: PromiseIndex,
  accountId: Bytes,
  methodName: Bytes,
  args: Bytes,
  amount: NearAmount,
  gas: NearAmount
): PromiseIndex {
  return env.promise_then(
    promiseIndex,
    accountId,
    methodName,
    args,
    amount,
    gas
  ) as PromiseIndex;
}

/**
 * Join an arbitrary array of NEAR promises.
 *
 * @param promiseIndexes - An arbitrary array of NEAR promise indexes to join.
 */
export function promiseAnd(...promiseIndexes: PromiseIndex[]): PromiseIndex {
  return env.promise_and(...promiseIndexes) as PromiseIndex;
}

/**
 * Create a NEAR promise which will have multiple promise actions inside.
 *
 * @param accountId - The account ID of the target contract.
 */
export function promiseBatchCreate(accountId: Bytes): PromiseIndex {
  return env.promise_batch_create(accountId) as PromiseIndex;
}

/**
 * Attach a callback NEAR promise to a batch of NEAR promise actions.
 *
 * @param promiseIndex - The NEAR promise index of the batch.
 * @param accountId - The account ID of the target contract.
 */
export function promiseBatchThen(
  promiseIndex: PromiseIndex,
  accountId: Bytes
): PromiseIndex {
  return env.promise_batch_then(promiseIndex, accountId) as PromiseIndex;
}

/**
 * Attach a create account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a create account action to.
 */
export function promiseBatchActionCreateAccount(
  promiseIndex: PromiseIndex
): void {
  env.promise_batch_action_create_account(promiseIndex);
}

/**
 * Attach a deploy contract promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a deploy contract action to.
 * @param code - The WASM byte code of the contract to be deployed.
 */
export function promiseBatchActionDeployContract(
  promiseIndex: PromiseIndex,
  code: Bytes
): void {
  env.promise_batch_action_deploy_contract(promiseIndex, code);
}

/**
 * Attach a function call promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call action to.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
export function promiseBatchActionFunctionCall(
  promiseIndex: PromiseIndex,
  methodName: Bytes,
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

/**
 * Attach a transfer promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a transfer action to.
 * @param amount - The amount of NEAR to transfer.
 */
export function promiseBatchActionTransfer(
  promiseIndex: PromiseIndex,
  amount: NearAmount
): void {
  env.promise_batch_action_transfer(promiseIndex, amount);
}

/**
 * Attach a stake promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a stake action to.
 * @param amount - The amount of NEAR to stake.
 * @param publicKey - The public key with which to stake.
 */
export function promiseBatchActionStake(
  promiseIndex: PromiseIndex,
  amount: NearAmount,
  publicKey: Bytes
): void {
  env.promise_batch_action_stake(promiseIndex, amount, publicKey);
}

/**
 * Attach a add full access key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a add full access key action to.
 * @param publicKey - The public key to add as a full access key.
 * @param nonce - The nonce to use.
 */
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

/**
 * Attach a add access key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a add access key action to.
 * @param publicKey - The public key to add.
 * @param nonce - The nonce to use.
 * @param allowance - The allowance of the access key.
 * @param receiverId - The account ID of the receiver.
 * @param methodNames - The names of the method to allow the key for.
 */
export function promiseBatchActionAddKeyWithFunctionCall(
  promiseIndex: PromiseIndex,
  publicKey: Bytes,
  nonce: number | bigint,
  allowance: NearAmount,
  receiverId: Bytes,
  methodNames: Bytes
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

/**
 * Attach a delete key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete key action to.
 * @param publicKey - The public key to delete.
 */
export function promiseBatchActionDeleteKey(
  promiseIndex: PromiseIndex,
  publicKey: Bytes
): void {
  env.promise_batch_action_delete_key(promiseIndex, publicKey);
}

/**
 * Attach a delete account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete account action to.
 * @param beneficiaryId - The account ID of the beneficiary - the account that receives the remaining amount of NEAR.
 */
export function promiseBatchActionDeleteAccount(
  promiseIndex: PromiseIndex,
  beneficiaryId: Bytes
): void {
  env.promise_batch_action_delete_account(promiseIndex, beneficiaryId);
}

/**
 * Attach a function call with weight promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call with weight action to.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 * @param weight - The weight of unused Gas to use.
 */
export function promiseBatchActionFunctionCallWeight(
  promiseIndex: PromiseIndex,
  methodName: Bytes,
  args: Bytes,
  amount: NearAmount,
  gas: NearAmount,
  weight: GasWeight
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

/**
 * The number of promise results available.
 */
export function promiseResultsCount(): bigint {
  return env.promise_results_count();
}

/**
 * Returns the result of the NEAR promise for the passed promise index.
 *
 * @param promiseIndex - The index of the promise to return the result for.
 */
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

/**
 * Executes the promise in the NEAR WASM virtual machine.
 *
 * @param promiseIndex - The index of the promise to execute.
 */
export function promiseReturn(promiseIndex: PromiseIndex): void {
  env.promise_return(promiseIndex);
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

export function validatorStake(accountId: Bytes): bigint {
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
