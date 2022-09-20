import { near, bytes, includeBytes } from "near-sdk-js";

export function test_promise_batch_stake() {
  let promiseId = near.promiseBatchCreate("caller2.test.near");
  near.promiseBatchActionStake(
    promiseId,
    100000000000000000000000000000n,
    near.signerAccountPk()
  );
  near.promiseReturn(promiseId);
}

export function test_transfer_overflow() {
  let promiseId = near.promiseBatchCreate("c.caller2.test.near");
  near.promiseBatchActionCreateAccount(promiseId);
  near.promiseBatchActionTransfer(promiseId, BigInt(2) ** BigInt(128));
  near.promiseReturn(promiseId);
}

export function test_promise_add_full_access_key() {
  let promiseId = near.promiseBatchCreate("c.caller2.test.near");
  near.promiseBatchActionCreateAccount(promiseId);
  near.promiseBatchActionTransfer(promiseId, 10000000000000000000000000n);
  near.promiseBatchActionAddKeyWithFullAccess(
    promiseId,
    near.signerAccountPk(),
    1n
  );
  near.promiseReturn(promiseId);
}

export function test_delete_account() {
  let promiseId = near.promiseBatchCreate("e.caller2.test.near");
  near.promiseBatchActionCreateAccount(promiseId);
  near.promiseBatchActionTransfer(promiseId, 10000000000000000000000000n);
  near.promiseBatchActionDeleteAccount(promiseId, near.signerAccountId());
  near.promiseReturn(promiseId);
}

export function test_promise_add_function_call_access_key() {
  let promiseId = near.promiseBatchCreate("d.caller2.test.near");
  near.promiseBatchActionCreateAccount(promiseId);
  near.promiseBatchActionTransfer(promiseId, 10000000000000000000000000n);
  near.promiseBatchActionAddKeyWithFunctionCall(
    promiseId,
    near.signerAccountPk(),
    1n,
    250000000000000000000000n,
    "caller2.test.near",
    "test_promise_batch_create_transfer"
  );
  near.promiseReturn(promiseId);
}

export function test_promise_batch_create_transfer() {
  let promiseId = near.promiseBatchCreate("a.caller2.test.near");
  near.promiseBatchActionCreateAccount(promiseId);
  near.promiseBatchActionTransfer(promiseId, 10000000000000000000000000n);
  near.promiseReturn(promiseId);
}

export function test_promise_batch_call_weight() {
  let promiseId = near.promiseBatchCreate("callee-contract.test.near");
  near.promiseBatchActionFunctionCallWeight(
    promiseId,
    "cross_contract_call_gas",
    bytes("abc"),
    0,
    0,
    1
  );
  near.promiseReturn(promiseId);
}

export function test_promise_batch_deploy_call() {
  let promiseId = near.promiseBatchCreate("b.caller2.test.near");
  near.promiseBatchActionCreateAccount(promiseId);
  near.promiseBatchActionTransfer(promiseId, 10000000000000000000000000n);
  // deploy content of promise_api.wasm to `b.caller2.test.near`
  // Note, we do not use `bytes()`, it's too expensive for long bytes and exceed gas limit
  near.promiseBatchActionDeployContract(
    promiseId,
    includeBytes("../build/promise_api.wasm")
  );
  near.promiseBatchActionFunctionCall(
    promiseId,
    "cross_contract_callee",
    bytes("abc"),
    0,
    2 * Math.pow(10, 13)
  );
  near.promiseReturn(promiseId);
}
