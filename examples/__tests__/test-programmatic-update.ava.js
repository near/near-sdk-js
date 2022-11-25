import { Worker } from "near-workspaces";
import test from "ava";
import * as fs from "fs";
import * as path from "path";

test.beforeEach(async (t) => {
  const worker = await Worker.init();
  const root = worker.rootAccount;

  const ali = await root.createSubAccount("ali");

  const contract = await root.devDeploy(
    "build/programmatic-update-before.wasm"
  );

  await contract.call(contract, "init", { manager: ali.accountId });

  t.context.worker = worker;
  t.context.accounts = { root, contract, ali };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("the contract can be programmatically updated", async (t) => {
  const { ali, contract } = t.context.accounts;

  // ASSERT BEFORE CODE UPDATE
  const codeBefore = await contract.viewCodeRaw();
  const beforeDefaultGreeting = await contract.view("get_greeting", {});
  t.is(beforeDefaultGreeting, "Hello");

  // ACT (UPDATE CODE)
  const code = fs.readFileSync(
    path.resolve("./build/programmatic-update-after.wasm")
  );
  await ali.call(contract, "updateContract", code, {
    gas: "300" + "0".repeat(12), // 300 Tgas
  });

  // ASSERT AFTER CODE UPDATE
  const codeAfter = await contract.viewCodeRaw();
  const afterDefaultGreeting = await contract.view("view_greeting", {});
  t.not(codeBefore, codeAfter, "code should be different after update");
  t.is(afterDefaultGreeting, "Hi");
});
