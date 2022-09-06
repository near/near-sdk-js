import {NearBindgen, call, view, NearPromise, near, bytes} from 'near-sdk-js'
import { PublicKey } from 'near-sdk-js/lib/types';

function callingData() {
    return {
        currentAccountId: near.currentAccountId(),
        signerAccountId: near.signerAccountId(),
        predecessorAccountId: near.predecessorAccountId(),
        input: near.input(),
    }
}

function arrayN(n) {
    return [...Array(Number(n)).keys()]
}

@NearBindgen({})
class HighlevelPromiseContract {
    @call
    test_promise_batch_stake() {
        let promise = NearPromise.new('highlevel-promise.test.near')
            .stake(100000000000000000000000000000n, new PublicKey(near.signerAccountPk()))

        return promise;
    }

    @call
    test_promise_batch_create_transfer() {
        let promise = NearPromise.new('a.highlevel-promise.test.near')
            .createAccount()
            .transfer(10000000000000000000000000n)
        return promise;
    }

    @call
    test_promise_add_full_access_key() {
        let promise = NearPromise.new('c.highlevel-promise.test.near')
            .createAccount()
            .transfer(10000000000000000000000000n)
            .addFullAccessKey(new PublicKey(near.signerAccountPk()))
        return promise;
    }
    
    @call
    test_promise_add_function_call_access_key() {
        let promise = NearPromise.new('d.highlevel-promise.test.near')
            .createAccount()
            .transfer(10000000000000000000000000n)
            .addAccessKey(new PublicKey(near.signerAccountPk()), 250000000000000000000000n, 'highlevel-promise.test.near', 'test_promise_batch_create_transfer')
        return promise;
    }

    @call
    test_delete_account() {
        let promise = NearPromise.new('e.highlevel-promise.test.near')
            .createAccount()
            .transfer(10000000000000000000000000n)
            .deleteAccount(near.signerAccountId())
        return promise;
    }

    @call
    test_promise_then() {
        let promise = NearPromise.new('callee-contract.test.near')
            .functionCall('cross_contract_callee', bytes('abc'), 0, 2 * Math.pow(10, 13))
            .then(NearPromise.new('highlevel-promise.test.near').functionCall('cross_contract_callback', bytes(JSON.stringify({callbackArg1: 'def'})), 0, 2 * Math.pow(10, 13)))
        return promise;
    }
    
    @call
    test_promise_and() {
        let promise = NearPromise.new('callee-contract.test.near')
            .functionCall('cross_contract_callee', bytes('abc'), 0, 2 * Math.pow(10, 13))
        let promise2 = NearPromise.new('callee-contract.test.near')
            .functionCall('cross_contract_callee', bytes('def'), 0, 2 * Math.pow(10, 13))
        let retPromise = promise.and(promise2).then(
            NearPromise.new('highlevel-promise.test.near')
                .functionCall('cross_contract_callback', bytes(JSON.stringify({callbackArg1: 'ghi'})), 0, 3 * Math.pow(10, 13)))

        return retPromise;
    }
    
    @call
    cross_contract_callback({callbackArg1}) {
        return {...callingData(), promiseResults: arrayN(near.promiseResultsCount()).map(i => near.promiseResult(i)), callbackArg1}
    }
}