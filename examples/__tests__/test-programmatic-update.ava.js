import { Worker } from "near-workspaces";
import test from "ava";
import * as fs from 'fs';
import * as path from "path";

test.beforeEach(async (t) => {
  const worker = await Worker.init();
  const root = worker.rootAccount;

  const ali = await root.createSubAccount("ali");

  const programmaticUpdate = await root.devDeploy("build/programmatic-update.wasm");

  await programmaticUpdate.call(programmaticUpdate, "init", { manager: ali.accountId });

  t.context.worker = worker;
  t.context.accounts = { root, programmaticUpdate, ali };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});


test("the contract can update itself", async (t) => {
  const { ali, programmaticUpdate } = t.context.accounts;

  const code = fs.readFileSync(path.resolve("./build/programmatic-update.wasm"));

  // Ali is the manager, asks the contract to update itself

  // QUESTION: IN WHICH FORMAT SHOULD WE PASS THE WASM CODE AS ARGS? THE CODE IS OF TYPE BUFFER
  const result = await ali.callRaw(programmaticUpdate, "updateContract", {
    code
  }, {
    gas: "300000000000000"
  });
 
  console.log(JSON.stringify(result.status))

  // THE CALL FAILS WITH THE FOLLOWING MESSAGE
  // {"Failure":{"ActionError":{"index":0,"kind":{"FunctionCallError":{"ExecutionError":"Exceeded the maximum amount of gas allowed to burn per contract."}}}}}
  
  t.not(result.status.SuccessValue, undefined)

});
