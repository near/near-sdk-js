import { env } from "yargs"

const U64_MAX = 2n**64n - 1n
const EVICTED_REGISTER = U64_MAX - 1n

// Common APIs
export function log(message) {
    env.log(message)
}

export function signerAccountId() {
    env.signer_account_id(0)
    return env.read_register(0)
}

export function signerAccountPk() {
    env.signer_account_pk(0)
    return env.read_register(0)
}

export function predecessorAccountId() {
    env.predecessor_account_id(0)
    return env.read_register(0)
}

export function blockIndex() {
    return env.block_index()
}

export function blockHeight() {
    return blockIndex()
}

export function blockTimestamp() {
    return env.block_timestamp()
}

export function epochHeight() {
    return env.epoch_height()
}

export function attachedDeposit() {
    return env.attached_deposit()
}

export function prepaidGas() {
    return env.prepaid_gas()
}

export function usedGas() {
    return env.used_gas()
}

export function randomSeed() {
    env.random_seed(0)
    return env.read_register(0)
}

export function sha256(value) {
    env.sha256(value, 0)
    return env.read_register(0)
}

export function keccak256(value) {
    env.keccak256(value, 0)
    return env.read_register(0)
}

export function keccak512(value) {
    env.keccak512(value, 0)
    return env.read_register(0)
}

export function ripemd160(value) {
    env.ripemd160(value, 0)
    return env.read_register(0)
}

export function ecrecover(hash, sign, v, malleabilityFlag) {
    let ret = env.ecrecover(hash, sign, v, malleabilityFlag, 0)
    if (ret === 0n) {
        return null
    }
    return env.read_register(0)
}

export function panic(msg) {
    if (msg !== undefined) {
        env.panic(msg)
    } else {
        env.panic()
    }
}

export function panicUtf8(msg) {
    env.panic_utf8(msg)
}

export function logUtf8(msg) {
    env.log_utf8(msg)
}

export function logUtf16(msg) {
    env.log_utf16(msg)
}

export function storageRead(key) {
    let ret = env.storage_read(key, 0)
    if (ret === 1n) {
        return env.read_register(0)
    } else {
        return null
    }
}

export function storageHasKey(key) {
    let ret = env.storage_has_key(key)
    if (ret === 1n) {
        return true
    } else {
        return false
    }
}

export function validatorStake(accountId) {
    return env.validator_stake(accountId)
}

export function validatorTotalStake() {
    return env.validator_total_stake()
}

export function altBn128G1Multiexp(value) {
    env.alt_bn128_g1_multiexp(value, 0)
    return env.read_register(0)
}

export function altBn128G1Sum(value) {
    env.alt_bn128_g1_sum(value, 0)
    return env.read_register(0)
}

export function altBn128PairingCheck(value) {
    let ret = env.alt_bn128_pairing_check(value)
    if (ret === 1n) {
        return true
    } else {
        return false
    }
}

export function storageGetEvicted() {
    return env.read_register(EVICTED_REGISTER)
}

// JSVM only APIs
export function jsvmAccountId() {
    env.jsvm_account_id(0)
    return env.read_register(0)
}

export function jsvmJsContractName() {
    env.jsvm_js_contract_name(0)
    return env.read_register(0)
}

export function jsvmMethodName() {
    env.jsvm_method_name(0)
    return env.read_register(0)
}

export function jsvmArgs() {
    env.jsvm_args(0)
    return env.read_register(0)
}

export function jsvmStorageWrite(key, value) {
    let exist = env.jsvm_storage_write(key, value, EVICTED_REGISTER)
    if (exist === 1n) {
        return true
    }
    return false
}

export function jsvmStorageRead(key) {
    let exist = env.jsvm_storage_read(key, 0)
    if (exist === 1n) {
        return env.read_register(0)
    }
    return null
}

export function jsvmStorageRemove(key) {
    let exist = env.jsvm_storage_remove(key, EVICTED_REGISTER)
    if (exist === 1n) {
        return true
    }
    return false
}

export function jsvmStorageHasKey(key) {
    let exist = env.jsvm_storage_has_key(key)
    if (exist === 1n) {
        return true
    }
    return false
}

export function jsvmCallRaw(contractName, method, args) {
    env.jsvm_call(contractName, method, JSON.stringify(args), 0)
    return env.read_register(0)
}

export function jsvmCall(contractName, method, args) {
    let ret =  jsvmCallRaw(contractName, method, args)
    if (ret === null) {
        return ret
    }
    return JSON.parse(ret)
}

export function jsvmValueReturn(value) {
    env.jsvm_value_return(value)
}

// Standalone only APIs
export function currentAccountId() {
    env.current_account_id(0)
    return env.read_register(0)
}

export function input() {
    env.input(0)
    return env.read_register(0)
}

export function storageUsage() {
    env.storageUsage(0)
    return env.storage_usage(0)
}

export function accountBalance() {
    return env.account_balance()
}

export function accountLockedBalance() {
    return env.account_locked_balance()
}

export function valueReturn(value) {
    env.value_return(value)
}

export function promiseCreate(accountId, methodName, arguments, amount, gas) {
    return env.promise_create(accountId, methodName, arguments, amount, gas)
}

export function promiseThen(promiseIndex, accountId, methodName, arguments, amount, gas) {
    return env.promise_then(promiseIndex, accountId, methodName, arguments, amount, gas)
}

export function promiseAnd(...promiseIndex) {
    return env.promise(...promiseIndex)
}

export function promiseBatchCreate(accountId) {
    return env.promise_batch_create(accountId)
}

export function promiseBatchThen(promiseIndex, accountId) {
    return env.promise_batch_then(promiseIndex, accountId)
}

export function promiseBatchActionCreateAccount(promiseIndex) {
    env.promise_batch_action_create_account(promiseIndex)
}

export function promiseBatchActionDeployContract(promiseIndex, code) {
    env.promise_batch_action_deploy_contract(promiseIndex, code)
}

export function promiseBatchActionFunctionCall(promiseIndex, methodName, arguments, amount, gas) {
    env.promise_batch_action_function_call(promiseIndex, methodName, arguments, amount, gas)   
}

export function promiseBatchActionTransfer(promiseIndex, amount) {
    env.promise_batch_action_transfer(promiseIndex, amount)
}

export function promiseBatchActionStake(promiseIndex, amount, publicKey) {
    env.promise_batch_action_stake(promiseIndex, amount, publicKey)
}

export function promiseBatchActionAddKeyWithFullAccess(promiseIndex, publicKey, nonce) {
    env.promise_batch_action_add_key_with_full_access(promiseIndex, publicKey, nonce)
}

export function promiseBatchActionAddKeyWithFunctionCall(promiseIndex, publicKey, nonce, allowance, receiverId, methodNames) {
    env.promise_batch_action_add_key_with_function_call(promiseIndex, publicKey, nonce, allowance, receiverId, methodNames)
}

export function promiseBatchActionDeleteKey(promiseIndex, publicKey) {
    env.promise_batch_action_delete_key(promiseIndex, publicKey)
}

export function promiseBatchActionDeleteAccount(promiseIndex, beneficiaryId) {
    env.promise_batch_action_delete_account(promiseIndex, beneficiaryId)
}

export function promiseResultsCount() {
    return env.promise_results_count()
}

export const PROMISE_RESULT_NOT_READY = 0n
export const PROMISE_RESULT_SUCCESSFUL = 1n
export const PROMISE_RESULT_FAILED = 2n

export function promiseResult(resultIdx) {
    let status = env.promise_result(resultIdx, 0)
    if (status === PROMISE_RESULT_NOT_READY || status === PROMISE_RESULT_FAILED) {
        return {status}
    } else if (status === PROMISE_RESULT_SUCCESSFUL) {
        return {status, data: env.read_register(0)}
    } else {
        panic("Unexpected return code.")
    }
}

export function promiseReturn(promiseIdx) {
    env.promise_return(promiseIdx)
}

export function storageWrite(key, value) {
    let exist = env.storage_write(key, value, EVICTED_REGISTER)
    if (exist === 1n) {
        return true
    }
    return false
}

export function storageRemove(key) {
    let exist = env.storage_remove(key, EVICTED_REGISTER)
    if (exist === 1n) {
        return true
    }
    return false
}
