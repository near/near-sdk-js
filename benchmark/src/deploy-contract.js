import { near } from "near-sdk-js";

export function deploy_contract() {
  let promiseId = near.promiseBatchCreate("a.caller.test.near");
  near.promiseBatchActionCreateAccount(promiseId);
  near.promiseBatchActionTransfer(promiseId, 10000000000000000000000000n);
  near.promiseBatchActionDeployContract(
    promiseId,
    includeBytes("../../tests/build/promise_api.wasm")
  );
  near.promiseBatchActionFunctionCall(
    promiseId,
    "cross_contract_callee",
    "abc",
    0,
    2 * Math.pow(10, 13)
  );
  near.promiseReturn(promiseId);
}
