import { NearBindgen, call, NearPromise, near } from "near-sdk-js";
import { PublicKey } from "near-sdk-js";

function callingData() {
  return {
    currentAccountId: near.currentAccountId(),
    signerAccountId: near.signerAccountId(),
    predecessorAccountId: near.predecessorAccountId(),
    input: near.input(),
  };
}

function arrayN(n) {
  return [...Array(Number(n)).keys()];
}

@NearBindgen({})
export class HighlevelPromiseContract {
  @call({})
  test_promise_batch_stake() {
    let promise = NearPromise.new("highlevel-promise.test.near").stake(
      100000000000000000000000000000n,
      new PublicKey(near.signerAccountPk())
    );

    return promise;
  }

  @call({})
  test_promise_batch_create_transfer() {
    let promise = NearPromise.new("a.highlevel-promise.test.near")
      .createAccount()
      .transfer(10000000000000000000000000n);
    return promise;
  }

  @call({})
  test_promise_add_full_access_key() {
    let promise = NearPromise.new("c.highlevel-promise.test.near")
      .createAccount()
      .transfer(10000000000000000000000000n)
      .addFullAccessKey(new PublicKey(near.signerAccountPk()));
    return promise;
  }

  @call({})
  test_promise_add_function_call_access_key() {
    let promise = NearPromise.new("d.highlevel-promise.test.near")
      .createAccount()
      .transfer(10000000000000000000000000n)
      .addAccessKey(
        new PublicKey(near.signerAccountPk()),
        250000000000000000000000n,
        "highlevel-promise.test.near",
        "test_promise_batch_create_transfer"
      );
    return promise;
  }

  @call({})
  test_delete_account() {
    let promise = NearPromise.new("e.highlevel-promise.test.near")
      .createAccount()
      .transfer(10000000000000000000000000n)
      .deleteAccount(near.signerAccountId());
    return promise;
  }

  @call({})
  test_promise_then() {
    let promise = NearPromise.new("callee-contract.test.near")
      .functionCall("cross_contract_callee", "abc", 0, 2 * Math.pow(10, 13))
      .then(
        NearPromise.new("highlevel-promise.test.near").functionCall(
          "cross_contract_callback",
          JSON.stringify({ callbackArg1: "def" }),
          0,
          2 * Math.pow(10, 13)
        )
      );
    return promise;
  }

  @call({})
  test_promise_and() {
    let promise = NearPromise.new("callee-contract.test.near").functionCall(
      "cross_contract_callee",
      "abc",
      0,
      2 * Math.pow(10, 13)
    );
    let promise2 = NearPromise.new("callee-contract.test.near").functionCall(
      "cross_contract_callee",
      "def",
      0,
      2 * Math.pow(10, 13)
    );
    let retPromise = promise
      .and(promise2)
      .then(
        NearPromise.new("highlevel-promise.test.near").functionCall(
          "cross_contract_callback",
          JSON.stringify({ callbackArg1: "ghi" }),
          0,
          3 * Math.pow(10, 13)
        )
      );

    return retPromise;
  }

  @call({})
  cross_contract_callback({ callbackArg1 }) {
    near.log("in callback");
    return {
      ...callingData(),
      promiseResults: arrayN(near.promiseResultsCount()).map((i) =>
        near.promiseResult(i)
      ),
      callbackArg1,
    };
  }

  @call({})
  cross_contract_callback_write_state() {
    // Attempt to write something in state. If this one is successfully executed and not revoked, these should be in state
    near.storageWrite("aaa", "bbb");
    near.storageWrite("ccc", "ddd");
    near.storageWrite("eee", "fff");
  }

  @call({})
  callee_panic() {
    let promise = NearPromise.new("callee-contract.test.near").functionCall(
      "just_panic",
      "",
      0,
      2 * Math.pow(10, 13)
    );
    return promise;
  }

  @call({})
  before_and_after_callee_panic() {
    near.log("log before call the callee");
    let promise = NearPromise.new("callee-contract.test.near").functionCall(
      "just_panic",
      "",
      0,
      2 * Math.pow(10, 13)
    );
    near.log("log after call the callee");
    return promise;
  }

  @call({})
  callee_panic_then() {
    let promise = NearPromise.new("callee-contract.test.near")
      .functionCall("just_panic", "", 0, 2 * Math.pow(10, 13))
      .then(
        NearPromise.new("highlevel-promise.test.near").functionCall(
          "cross_contract_callback_write_state",
          "",
          0,
          2 * Math.pow(10, 13)
        )
      );
    return promise;
  }

  @call({})
  callee_panic_and() {
    let promise = NearPromise.new("callee-contract.test.near").functionCall(
      "just_panic",
      "",
      0,
      2 * Math.pow(10, 13)
    );
    let promise2 = NearPromise.new("callee-contract.test.near").functionCall(
      "write_some_state",
      "",
      0,
      2 * Math.pow(10, 13)
    );
    let retPromise = promise
      .and(promise2)
      .then(
        NearPromise.new("highlevel-promise.test.near").functionCall(
          "cross_contract_callback_write_state",
          "",
          0,
          3 * Math.pow(10, 13)
        )
      );

    return retPromise;
  }

  @call({})
  callee_success_then_panic() {
    let promise = NearPromise.new("callee-contract.test.near")
      .functionCall("write_some_state", "abc", 0, 2 * Math.pow(10, 13))
      .then(
        NearPromise.new("callee-contract.test.near").functionCall(
          "just_panic",
          "",
          0,
          2 * Math.pow(10, 13)
        )
      );
    near.storageWrite("aaa", "bbb");
    return promise;
  }

  @call({})
  handler({ promiseId }) {
    // example to catch and handle one given promiseId. This is to simulate when you know some
    // promiseId can be possibly fail and some promiseId can never fail. If more than one promiseId
    // can be failed. a similar approach can be applied to all promiseIds.
    let res;
    try {
      res = near.promiseResult(promiseId);
    } catch (e) {
      throw new Error("caught error in the callback: " + e.toString());
    }
    return "callback got " + res;
  }

  @call({})
  handle_error_in_promise_then() {
    let promise = NearPromise.new("callee-contract.test.near")
      .functionCall("just_panic", "", 0, 2 * Math.pow(10, 13))
      .then(
        NearPromise.new("highlevel-promise.test.near").functionCall(
          "handler",
          JSON.stringify({ promiseId: 0 }),
          0,
          2 * Math.pow(10, 13)
        )
      );
    return promise;
  }

  @call({})
  handle_error_in_promise_then_after_promise_and() {
    let promise = NearPromise.new("callee-contract.test.near")
      .functionCall("cross_contract_callee", "abc", 0, 2 * Math.pow(10, 13))
      .and(
        NearPromise.new("callee-contract.test.near").functionCall(
          "just_panic",
          "",
          0,
          2 * Math.pow(10, 13)
        )
      )
      .then(
        NearPromise.new("highlevel-promise.test.near").functionCall(
          "handler",
          JSON.stringify({ promiseId: 1 }),
          0,
          2 * Math.pow(10, 13)
        )
      );
    return promise;
  }

  @call({})
  not_return_not_build() {
    // let promise = NearPromise.new("b.highlevel-promise.test.near")
    //   .createAccount()
    //   .transfer(10000000000000000000000000n);
    // nothing happens
  }

  @call({})
  build_not_return() {
    let promise = NearPromise.new("b.highlevel-promise.test.near")
      .createAccount()
      .transfer(10000000000000000000000000n);
    promise.build();
    // doesn't return the promise, but promise should be created and executed
  }
}
