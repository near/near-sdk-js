import { near, bytes } from "near-sdk-js";

function arrayN(n) {
  return [...Array(Number(n)).keys()];
}

export function just_panic() {
  throw new Error("it just panic");
}

export function write_some_state() {
  // Attempt to write something in state. If this one is successfully executed and not revoked, these should be in state
  near.storageWrite(bytes("aaa"), bytes("bbb"));
  near.storageWrite(bytes("ccc"), bytes("ddd"));
  near.storageWrite(bytes("eee"), bytes("fff"));
}

function callingData() {
  return {
    currentAccountId: near.currentAccountId(),
    signerAccountId: near.signerAccountId(),
    predecessorAccountId: near.predecessorAccountId(),
    input: near.input(),
  };
}

export function cross_contract_callee() {
  near.valueReturn(bytes(JSON.stringify(callingData())));
}

export function cross_contract_call_gas() {
  near.valueReturn(bytes(near.prepaidGas().toString()));
}

export function cross_contract_callback() {
  near.valueReturn(
    bytes(
      JSON.stringify({
        ...callingData(),
        promiseResults: arrayN(near.promiseResultsCount()).map((i) =>
          near.promiseResult(i)
        ),
      })
    )
  );
}

export function test_promise_create() {
  near.promiseCreate(
    "callee-contract.test.near",
    "cross_contract_callee",
    bytes("abc"),
    0,
    2 * Math.pow(10, 13)
  );
}

export function test_promise_create_gas_overflow() {
  near.promiseCreate(
    "callee-contract.test.near",
    "cross_contract_callee",
    bytes("abc"),
    0,
    BigInt(2) ** BigInt(64)
  );
}

export function test_promise_then() {
  let promiseId = near.promiseCreate(
    "callee-contract.test.near",
    "cross_contract_callee",
    bytes("abc"),
    0,
    2 * Math.pow(10, 13)
  );
  near.promiseThen(
    promiseId,
    "caller-contract.test.near",
    "cross_contract_callback",
    bytes("def"),
    0,
    2 * Math.pow(10, 13)
  );
}

export function test_promise_and() {
  let promiseId = near.promiseCreate(
    "callee-contract.test.near",
    "cross_contract_callee",
    bytes("abc"),
    0,
    2 * Math.pow(10, 13)
  );
  let promiseId2 = near.promiseCreate(
    "callee-contract.test.near",
    "cross_contract_callee",
    bytes("def"),
    0,
    2 * Math.pow(10, 13)
  );
  let promiseIdAnd = near.promiseAnd(promiseId, promiseId2);
  near.promiseThen(
    promiseIdAnd,
    "caller-contract.test.near",
    "cross_contract_callback",
    bytes("ghi"),
    0,
    3 * Math.pow(10, 13)
  );
}
