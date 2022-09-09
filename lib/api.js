import { PromiseResult } from "./types";
const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
export function log(...params) {
    env.log(`${params
        .map(x => x === undefined ? 'undefined' : x) // Stringify undefined
        .map(x => typeof (x) === 'object' ? JSON.stringify(x) : x) // Convert Objects to strings
        .join(' ')}` // Convert to string
    );
}
export function signerAccountId() {
    env.signer_account_id(0);
    return env.read_register(0);
}
export function signerAccountPk() {
    env.signer_account_pk(0);
    return env.read_register(0);
}
export function predecessorAccountId() {
    env.predecessor_account_id(0);
    return env.read_register(0);
}
export function blockIndex() {
    return env.block_index();
}
export function blockHeight() {
    return blockIndex();
}
export function blockTimestamp() {
    return env.block_timestamp();
}
export function epochHeight() {
    return env.epoch_height();
}
export function attachedDeposit() {
    return env.attached_deposit();
}
export function prepaidGas() {
    return env.prepaid_gas();
}
export function usedGas() {
    return env.used_gas();
}
export function randomSeed() {
    env.random_seed(0);
    return env.read_register(0);
}
export function sha256(value) {
    env.sha256(value, 0);
    return env.read_register(0);
}
export function keccak256(value) {
    env.keccak256(value, 0);
    return env.read_register(0);
}
export function keccak512(value) {
    env.keccak512(value, 0);
    return env.read_register(0);
}
export function ripemd160(value) {
    env.ripemd160(value, 0);
    return env.read_register(0);
}
export function ecrecover(hash, sig, v, malleabilityFlag) {
    let ret = env.ecrecover(hash, sig, v, malleabilityFlag, 0);
    if (ret === 0n) {
        return null;
    }
    return env.read_register(0);
}
// NOTE: "env.panic(msg)" is not exported, use "throw Error(msg)" instead
export function panicUtf8(msg) {
    env.panic_utf8(msg);
}
export function logUtf8(msg) {
    env.log_utf8(msg);
}
export function logUtf16(msg) {
    env.log_utf16(msg);
}
export function storageRead(key) {
    let ret = env.storage_read(key, 0);
    if (ret === 1n) {
        return env.read_register(0);
    }
    else {
        return null;
    }
}
export function storageHasKey(key) {
    let ret = env.storage_has_key(key);
    if (ret === 1n) {
        return true;
    }
    else {
        return false;
    }
}
export function validatorStake(accountId) {
    return env.validator_stake(accountId);
}
export function validatorTotalStake() {
    return env.validator_total_stake();
}
export function altBn128G1Multiexp(value) {
    env.alt_bn128_g1_multiexp(value, 0);
    return env.read_register(0);
}
export function altBn128G1Sum(value) {
    env.alt_bn128_g1_sum(value, 0);
    return env.read_register(0);
}
export function altBn128PairingCheck(value) {
    let ret = env.alt_bn128_pairing_check(value);
    if (ret === 1n) {
        return true;
    }
    else {
        return false;
    }
}
export function storageGetEvicted() {
    return env.read_register(EVICTED_REGISTER);
}
export function currentAccountId() {
    env.current_account_id(0);
    return env.read_register(0);
}
export function input() {
    env.input(0);
    return env.read_register(0);
}
export function storageUsage() {
    return env.storage_usage();
}
export function accountBalance() {
    return env.account_balance();
}
export function accountLockedBalance() {
    return env.account_locked_balance();
}
export function valueReturn(value) {
    env.value_return(value);
}
export function promiseCreate(accountId, methodName, args, amount, gas) {
    return env.promise_create(accountId, methodName, args, amount, gas);
}
export function promiseThen(promiseIndex, accountId, methodName, args, amount, gas) {
    return env.promise_then(promiseIndex, accountId, methodName, args, amount, gas);
}
export function promiseAnd(...promiseIndex) {
    return env.promise_and(...promiseIndex);
}
export function promiseBatchCreate(accountId) {
    return env.promise_batch_create(accountId);
}
export function promiseBatchThen(promiseIndex, accountId) {
    return env.promise_batch_then(promiseIndex, accountId);
}
export function promiseBatchActionCreateAccount(promiseIndex) {
    env.promise_batch_action_create_account(promiseIndex);
}
export function promiseBatchActionDeployContract(promiseIndex, code) {
    env.promise_batch_action_deploy_contract(promiseIndex, code);
}
export function promiseBatchActionFunctionCall(promiseIndex, methodName, args, amount, gas) {
    env.promise_batch_action_function_call(promiseIndex, methodName, args, amount, gas);
}
export function promiseBatchActionTransfer(promiseIndex, amount) {
    env.promise_batch_action_transfer(promiseIndex, amount);
}
export function promiseBatchActionStake(promiseIndex, amount, publicKey) {
    env.promise_batch_action_stake(promiseIndex, amount, publicKey);
}
export function promiseBatchActionAddKeyWithFullAccess(promiseIndex, publicKey, nonce) {
    env.promise_batch_action_add_key_with_full_access(promiseIndex, publicKey, nonce);
}
export function promiseBatchActionAddKeyWithFunctionCall(promiseIndex, publicKey, nonce, allowance, receiverId, methodNames) {
    env.promise_batch_action_add_key_with_function_call(promiseIndex, publicKey, nonce, allowance, receiverId, methodNames);
}
export function promiseBatchActionDeleteKey(promiseIndex, publicKey) {
    env.promise_batch_action_delete_key(promiseIndex, publicKey);
}
export function promiseBatchActionDeleteAccount(promiseIndex, beneficiaryId) {
    env.promise_batch_action_delete_account(promiseIndex, beneficiaryId);
}
export function promiseBatchActionFunctionCallWeight(promiseIndex, methodName, args, amount, gas, weight) {
    env.promise_batch_action_function_call_weight(promiseIndex, methodName, args, amount, gas, weight);
}
export function promiseResultsCount() {
    return env.promise_results_count();
}
export function promiseResult(resultIdx) {
    let status = env.promise_result(resultIdx, 0);
    if (status == PromiseResult.Successful) {
        return env.read_register(0);
    }
    else {
        throw Error(`Promise result ${status == PromiseResult.Failed ? "Failed" :
            status == PromiseResult.NotReady ? "NotReady" : status}`);
    }
}
export function promiseReturn(promiseIdx) {
    env.promise_return(promiseIdx);
}
export function storageWrite(key, value) {
    let exist = env.storage_write(key, value, EVICTED_REGISTER);
    if (exist === 1n) {
        return true;
    }
    return false;
}
export function storageRemove(key) {
    let exist = env.storage_remove(key, EVICTED_REGISTER);
    if (exist === 1n) {
        return true;
    }
    return false;
}
export function storageByteCost() {
    return 10000000000000000000n;
}
