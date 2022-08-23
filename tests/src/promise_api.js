import {near, bytes} from 'near-sdk-js'

function arrayN(n) {
    return [...Array(Number(n)).keys()]
}

function callingData() {
    return {
        currentAccountId: near.currentAccountId(),
        signerAccountId: near.signerAccountId(),
        predecessorAccountId: near.predecessorAccountId(),
        input: near.input(),
    }
}

export function cross_contract_callee() {
    near.valueReturn(bytes(JSON.stringify(callingData())))
}

export function cross_contract_callback() {
    near.valueReturn(bytes(JSON.stringify({...callingData(), promiseResults: arrayN(near.promiseResultsCount()).map(i => near.promiseResult(i))})))
}

export function test_promise_create() {
    near.promiseCreate('callee-contract.test.near', 'cross_contract_callee', bytes('abc'), 0, 2 * Math.pow(10, 13))
}

export function test_promise_create_gas_overflow() {
    near.promiseCreate('callee-contract.test.near', 'cross_contract_callee', bytes('abc'), 0, BigInt(2) ** BigInt(64))
}

export function test_promise_then() {
    let promiseId = near.promiseCreate('callee-contract.test.near', 'cross_contract_callee', bytes('abc'), 0, 2 * Math.pow(10, 13))
    near.promiseThen(promiseId, 'caller-contract.test.near', 'cross_contract_callback', bytes('def'), 0, 2 * Math.pow(10, 13))
}

export function test_promise_and() {
    let promiseId = near.promiseCreate('callee-contract.test.near', 'cross_contract_callee', bytes('abc'), 0, 2 * Math.pow(10, 13))
    let promiseId2 = near.promiseCreate('callee-contract.test.near', 'cross_contract_callee', bytes('def'), 0, 2 * Math.pow(10, 13))
    let promiseIdAnd = near.promiseAnd(promiseId, promiseId2)
    near.promiseThen(promiseIdAnd, 'caller-contract.test.near', 'cross_contract_callback', bytes('ghi'), 0, 3 * Math.pow(10, 13))
}
