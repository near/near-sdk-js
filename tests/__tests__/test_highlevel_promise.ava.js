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

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, highlevelPromise, ali, bob, calleeContract };
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
