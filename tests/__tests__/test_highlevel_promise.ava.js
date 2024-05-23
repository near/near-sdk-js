import { Worker } from "near-workspaces";
import test from "ava";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  const highlevelPromise = await root.createSubAccount("highlevel-promise", {
    initialBalance: "100100N",
  });
  await highlevelPromise.deploy("build/highlevel-promise.wasm");

  // Create and deploy callee contract
  const calleeContract = await root.createSubAccount("callee-contract");
  await calleeContract.deploy("build/promise_api.wasm");

  // Test users
  const ali = await root.createSubAccount("ali");
  const bob = await root.createSubAccount("bob");
  const carl = await root.createSubAccount("carl");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = {
    root,
    highlevelPromise,
    ali,
    bob,
    carl,
    calleeContract,
  };
});

test.after.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("highlevel promise create account, transfer", async (t) => {
  const { bob, highlevelPromise } = t.context.accounts;

  let r = await bob.callRaw(
    highlevelPromise,
    "test_promise_batch_create_transfer",
    "",
    { gas: "100 Tgas" }
  );
  t.is(
    r.result.receipts_outcome[1].outcome.executor_id,
    highlevelPromise.getSubAccount("a").accountId
  );
  t.is(r.result.receipts_outcome[1].outcome.status.SuccessValue, "");

  let balance = await highlevelPromise.getSubAccount("a").balance();
  t.is(balance.total.toString(), "10000000000000000000000000");
});

test("highlevel promise stake", async (t) => {
  const { highlevelPromise } = t.context.accounts;
  await highlevelPromise.callRaw(
    highlevelPromise,
    "test_promise_batch_stake",
    "",
    { gas: "100 Tgas" }
  );
  let balance = await highlevelPromise.balance();
  t.is(balance.staked.toString(), "100000000000000000000000000000");
});

test("highlevel promise add full access key", async (t) => {
  const { bob, highlevelPromise } = t.context.accounts;
  let r = await bob.callRaw(
    highlevelPromise,
    "test_promise_add_full_access_key",
    "",
    { gas: "100 Tgas" }
  );
  t.is(r.result.status.SuccessValue, "");
});

test("highlevel promise add function call key", async (t) => {
  const { bob, highlevelPromise } = t.context.accounts;
  let r = await bob.callRaw(
    highlevelPromise,
    "test_promise_add_function_call_access_key",
    "",
    { gas: "100 Tgas" }
  );
  t.is(r.result.status.SuccessValue, "");
});

test("highlevel promise delete account", async (t) => {
  const { bob, highlevelPromise } = t.context.accounts;
  let r = await bob.callRaw(highlevelPromise, "test_delete_account", "", {
    gas: "100 Tgas",
  });
  t.is(r.result.status.SuccessValue, "");
  t.is(await highlevelPromise.getSubAccount("e").exists(), false);
});

test("cross contract call panic", async (t) => {
  const { ali, highlevelPromise } = t.context.accounts;
  let r = await ali.callRaw(highlevelPromise, "callee_panic", "", {
    gas: "70 Tgas",
  });
  t.assert(
    r.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes(
      "Smart contract panicked: it just panic"
    )
  );
});

test("before and after cross contract call panic", async (t) => {
  const { carl, highlevelPromise } = t.context.accounts;
  let r = await carl.callRaw(
    highlevelPromise,
    "before_and_after_callee_panic",
    "",
    {
      gas: "70 Tgas",
    }
  );
  t.assert(
    r.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes(
      "Smart contract panicked: it just panic"
    )
  );
  // full transaction is revert, no log
  t.deepEqual(r.result.transaction_outcome.outcome.logs, []);
});

test("cross contract call panic then callback another contract method", async (t) => {
  const { carl, highlevelPromise } = t.context.accounts;
  let r = await carl.callRaw(highlevelPromise, "callee_panic_then", "", {
    gas: "70 Tgas",
  });
  // promise then will continue, even though the promise before promise.then failed
  t.is(r.result.status.SuccessValue, "");
  let state = await highlevelPromise.viewStateRaw();
  t.is(state.length, 4);
});

test("cross contract call panic and cross contract call success then callback another contract method", async (t) => {
  const { carl, highlevelPromise, calleeContract } = t.context.accounts;
  let r = await carl.callRaw(highlevelPromise, "callee_panic_and", "", {
    gas: "100 Tgas",
  });
  // promise `and` promise `then` continues, even though one of two promise and was failed. Entire transaction also success
  t.is(r.result.status.SuccessValue, "");
  let state = await calleeContract.viewStateRaw();
  t.is(state.length, 3);
  state = await highlevelPromise.viewStateRaw();
  t.is(state.length, 4);
});

test("cross contract call success then call a panic method", async (t) => {
  const { carl, highlevelPromise, calleeContract } = t.context.accounts;
  let r = await carl.callRaw(
    highlevelPromise,
    "callee_success_then_panic",
    "",
    {
      gas: "100 Tgas",
    }
  );
  // the last promise fail, cause the transaction fail
  t.assert(
    r.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes(
      "Smart contract panicked: it just panic"
    )
  );
  // but the first success cross contract call won't revert, the state is persisted
  let state = await calleeContract.viewStateRaw();
  t.is(state.length, 3);
});

test("handling error in promise then", async (t) => {
  const { carl, highlevelPromise } = t.context.accounts;
  let r = await carl.callRaw(
    highlevelPromise,
    "handle_error_in_promise_then",
    "",
    {
      gas: "70 Tgas",
    }
  );
  t.assert(
    r.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes(
      "caught error in the callback: "
    )
  );
});

test("handling error in promise then after promise and", async (t) => {
  const { carl, highlevelPromise } = t.context.accounts;
  let r = await carl.callRaw(
    highlevelPromise,
    "handle_error_in_promise_then_after_promise_and",
    "",
    {
      gas: "100 Tgas",
    }
  );
  t.assert(
    r.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes(
      "caught error in the callback: "
    )
  );
});

test("highlevel promise then", async (t) => {
  const { ali, highlevelPromise, calleeContract } = t.context.accounts;
  let r = await ali.callRaw(highlevelPromise, "test_promise_then", "", {
    gas: "70 Tgas",
  });
  // call the callee
  t.is(
    r.result.receipts_outcome[1].outcome.executor_id,
    calleeContract.accountId
  );
  t.deepEqual(
    JSON.parse(
      Buffer.from(
        r.result.receipts_outcome[1].outcome.status.SuccessValue,
        "base64"
      )
    ),
    {
      currentAccountId: calleeContract.accountId,
      signerAccountId: ali.accountId,
      predecessorAccountId: highlevelPromise.accountId,
      input: "abc",
    }
  );

  // the callback scheduled by promise_then
  t.is(
    r.result.receipts_outcome[3].outcome.executor_id,
    highlevelPromise.accountId
  );
  t.deepEqual(
    JSON.parse(
      Buffer.from(
        r.result.receipts_outcome[3].outcome.status.SuccessValue,
        "base64"
      )
    ),
    {
      currentAccountId: highlevelPromise.accountId,
      signerAccountId: ali.accountId,
      predecessorAccountId: highlevelPromise.accountId,
      input: '{"callbackArg1":"def"}',
      promiseResults: [
        JSON.stringify({
          currentAccountId: calleeContract.accountId,
          signerAccountId: ali.accountId,
          predecessorAccountId: highlevelPromise.accountId,
          input: "abc",
        }),
      ],
      callbackArg1: "def",
    }
  );
});

test("highlevel promise and", async (t) => {
  const { ali, highlevelPromise, calleeContract } = t.context.accounts;
  let r = await ali.callRaw(highlevelPromise, "test_promise_and", "", {
    gas: "150 Tgas",
  });

  // console.log(JSON.stringify(r, null, 2))
  // promise and schedule to call the callee
  t.is(
    r.result.receipts_outcome[1].outcome.executor_id,
    calleeContract.accountId
  );
  t.deepEqual(
    JSON.parse(
      Buffer.from(
        r.result.receipts_outcome[1].outcome.status.SuccessValue,
        "base64"
      )
    ),
    {
      currentAccountId: calleeContract.accountId,
      signerAccountId: ali.accountId,
      predecessorAccountId: highlevelPromise.accountId,
      input: "abc",
    }
  );

  // promise and schedule to call the callee, with different args
  t.is(
    r.result.receipts_outcome[3].outcome.executor_id,
    calleeContract.accountId
  );
  t.deepEqual(
    JSON.parse(
      Buffer.from(
        r.result.receipts_outcome[3].outcome.status.SuccessValue,
        "base64"
      )
    ),
    {
      currentAccountId: calleeContract.accountId,
      signerAccountId: ali.accountId,
      predecessorAccountId: highlevelPromise.accountId,
      input: "def",
    }
  );

  // the callback scheduled by promise_then on the promise created by promise_and
  t.is(
    r.result.receipts_outcome[5].outcome.executor_id,
    highlevelPromise.accountId
  );
  t.deepEqual(
    JSON.parse(
      Buffer.from(
        r.result.receipts_outcome[5].outcome.status.SuccessValue,
        "base64"
      )
    ),
    {
      currentAccountId: highlevelPromise.accountId,
      signerAccountId: ali.accountId,
      predecessorAccountId: highlevelPromise.accountId,
      input: '{"callbackArg1":"ghi"}',
      promiseResults: [
        JSON.stringify({
          currentAccountId: calleeContract.accountId,
          signerAccountId: ali.accountId,
          predecessorAccountId: highlevelPromise.accountId,
          input: "abc",
        }),
        JSON.stringify({
          currentAccountId: calleeContract.accountId,
          signerAccountId: ali.accountId,
          predecessorAccountId: highlevelPromise.accountId,
          input: "def",
        }),
      ],
      callbackArg1: "ghi",
    }
  );
});

test("highlevel promise not build and not return", async (t) => {
  const { bob, highlevelPromise } = t.context.accounts;

  let r = await bob.callRaw(highlevelPromise, "not_return_not_build", "", {
    gas: "100 Tgas",
  });

  try {
    let balance = await highlevelPromise.getSubAccount("b").balance();
  } catch (e) {
    t.is(e.type, "AccountDoesNotExist");
  }
});

test("highlevel promise build and not return", async (t) => {
  const { bob, highlevelPromise } = t.context.accounts;

  let r = await bob.callRaw(highlevelPromise, "build_not_return", "", {
    gas: "100 Tgas",
  });
  t.is(
    r.result.receipts_outcome[1].outcome.executor_id,
    highlevelPromise.getSubAccount("b").accountId
  );
  t.is(r.result.receipts_outcome[1].outcome.status.SuccessValue, "");

  let balance = await highlevelPromise.getSubAccount("b").balance();
  t.is(balance.total.toString(), "10000000000000000000000000");
});
