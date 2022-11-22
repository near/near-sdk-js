import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  const worker = await Worker.init();
  const root = worker.rootAccount;

  const reqireInitFalse = await root.devDeploy("build/require_init_false.wasm");
  const reqireInitTrue = await root.devDeploy("build/require_init_true.wasm");

  const ali = await root.createSubAccount("ali");

  t.context.worker = worker;
  t.context.accounts = {
    root,
    reqireInitFalse,
    reqireInitTrue,
    ali,
  };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("Uninitialized contract throw error if requireInit = true", async (t) => {
  const { ali, reqireInitTrue } = t.context.accounts;

  const callResult = await ali.callRaw(reqireInitTrue, "setStatus", {
    status: "hello",
  });
  t.assert(
    callResult.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes(
      "Contract must be initialized"
    )
  );

  const err = await t.throwsAsync(() => reqireInitTrue.view("getStatus", {}));
  t.assert(err.message.includes("Contract must be initialized"));
});

test("Uninitialized contract does not throw error if requireInit = false", async (t) => {
  const { ali, reqireInitFalse } = t.context.accounts;

  await ali.callRaw(reqireInitFalse, "setStatus", { status: "hello" });

  t.is(await reqireInitFalse.view("getStatus", {}), "hello");
});

test("Init function panics if called more then once", async (t) => {
  const { ali, reqireInitTrue, reqireInitFalse } = t.context.accounts;

  await ali.call(reqireInitTrue, "init", { status: "hello" });
  const res1 = await ali.callRaw(reqireInitTrue, "init", { status: "hello" });
  t.assert(
    res1.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes(
      "Contract already initialized"
    )
  );

  await ali.call(reqireInitFalse, "init", { status: "hello" });
  const res2 = await ali.callRaw(reqireInitFalse, "init", { status: "hello" });
  t.assert(
    res2.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes(
      "Contract already initialized"
    )
  );
});
