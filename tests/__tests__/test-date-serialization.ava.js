import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Create and deploy test contract
  const dsContract = await root.createSubAccount("ds-contract");
  await dsContract.deploy("build/date-serialization.wasm");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, dsContract };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("get initial date field value", async (t) => {
  const { dsContract } = t.context.accounts;
  const dateField = await dsContract.view("getDateField");
  t.is(dateField, new Date(0).toISOString());
});

test("get date field after set", async (t) => {
  const { dsContract } = t.context.accounts;
  const dateField = await dsContract.view("getDateField");
  t.is(dateField, new Date(0).toISOString());

  const newDate = new Date();
  await dsContract.call(dsContract, "setDateField", { dateField: newDate });
  const afterSet = await dsContract.view("getDateField");
  t.is(afterSet, newDate.toISOString());
});

test("get date field in milliseconds", async (t) => {
  const { dsContract } = t.context.accounts;
  const dateField = await dsContract.view("getDateFieldAsMilliseconds");
  t.is(dateField, new Date(0).getTime());

  const newDate = new Date();
  await dsContract.call(dsContract, "setDateField", { dateField: newDate });
  const afterIncrement = await dsContract.view("getDateFieldAsMilliseconds");
  t.is(afterIncrement, newDate.getTime());
});
