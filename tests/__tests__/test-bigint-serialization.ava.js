import { Worker } from "near-workspaces";
import test from "ava";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Create and deploy test contract
  const bsContract = await root.devDeploy("build/bigint-serialization.wasm");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, bsContract };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("get initial bigint field value", async (t) => {
  const { bsContract } = t.context.accounts;
  const bigintField = await bsContract.view("getBigintField");
  t.is(bigintField, `${1n}`);
});

test("get bigint field after increment", async (t) => {
  const { bsContract } = t.context.accounts;
  const bigintField = await bsContract.view("getBigintField");
  t.is(bigintField, `${1n}`);

  await bsContract.call(bsContract, "increment", "");
  const afterIncrement = await bsContract.view("getBigintField");
  t.is(afterIncrement, `${2n}`);
});

test("get bigint field after set", async (t) => {
  const { bsContract } = t.context.accounts;
  const bigintField = await bsContract.view("getBigintField");
  t.is(bigintField, `${1n}`);

  await bsContract.call(bsContract, "setBigintField", { bigintField: `${3n}` });
  const afterSet = await bsContract.view("getBigintField");
  t.is(afterSet, `${3n}`);
});
