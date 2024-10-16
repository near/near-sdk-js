import { Worker } from "near-workspaces";
import test from "ava";
import { logTotalGas, randomInt } from "./util.js";

const COLLECTION_SIZE = 20;

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the test contracts.
  const lookupMapContract = await root.devDeploy("build/lookup-map.wasm");
  const lookupSetContract = await root.devDeploy("build/lookup-set.wasm");
  const unorderedMapContract = await root.devDeploy("build/unordered-map.wasm");
  const unorderedSetContract = await root.devDeploy("build/unordered-set.wasm");
  const vectorContract = await root.devDeploy("build/vector.wasm");

  // Test users
  const ali = await root.createSubAccount("ali");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = {
    root,
    lookupMapContract,
    lookupSetContract,
    unorderedMapContract,
    unorderedSetContract,
    vectorContract,
    ali,
  };
});

test.after.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
      console.log("Failed to tear down the worker:", error);
  });
});

test("JS lookup map contract operations", async (t) => {
  const { ali, lookupMapContract } = t.context.accounts;
  
  let rAdd;
  for (let i = 0; i < COLLECTION_SIZE; i++) {
    rAdd = await ali.callRaw(lookupMapContract, "addElement", { key: i, value: i });
  }
  t.is(rAdd.result.status.SuccessValue, "");
  logTotalGas("Add element", rAdd, t);

  const val = randomInt(COLLECTION_SIZE);
  const rGet = await ali.callRaw(lookupMapContract, "getElement", { key: val });
  t.is(JSON.parse(Buffer.from(rGet.result.status.SuccessValue, "base64")), val);
  logTotalGas("Get element", rGet, t);

  const rRem = await ali.callRaw(lookupMapContract, "removeElement", { key: randomInt(COLLECTION_SIZE) });
  t.is(rRem.result.status.SuccessValue, "");
  logTotalGas("Remove element", rRem, t);
});

test("JS lookup set contract operations", async (t) => {
  const { ali, lookupSetContract } = t.context.accounts;

  let rAdd;
  for (let i = 0; i < COLLECTION_SIZE; i++) {
    rAdd = await ali.callRaw(lookupSetContract, "addElement", { value: i });
  }
  t.is(rAdd.result.status.SuccessValue, "");
  logTotalGas("Add element", rAdd, t);

  const rGet = await ali.callRaw(lookupSetContract, "containsElement", { value: randomInt(COLLECTION_SIZE) });
  t.is(JSON.parse(Buffer.from(rGet.result.status.SuccessValue, "base64")), true);
  logTotalGas("Get element", rGet, t);

  const rRem = await ali.callRaw(lookupSetContract, "removeElement", { value: randomInt(COLLECTION_SIZE) });
  t.is(rRem.result.status.SuccessValue, "");
  logTotalGas("Remove element", rRem, t);
});

test("JS unordered map contract operations", async (t) => {
  const { ali, unorderedMapContract } = t.context.accounts;

  let rAdd;
  for (let i = 0; i < COLLECTION_SIZE; i++) {
    rAdd = await ali.callRaw(unorderedMapContract, "addElement", { key: i, value: i });
  }
  t.is(rAdd.result.status.SuccessValue, "");
  logTotalGas("Add element", rAdd, t);

  const val = randomInt(COLLECTION_SIZE);
  const rGet = await ali.callRaw(unorderedMapContract, "getElement", { key: val });
  t.is(JSON.parse(Buffer.from(rGet.result.status.SuccessValue, "base64")), val);
  logTotalGas("Get element", rGet, t);

  const rIt = await ali.callRaw(unorderedMapContract, "iterate", {});
  t.is(rIt.result.status.SuccessValue, "");
  logTotalGas("Iterate collection", rIt, t);

  const rRem = await ali.callRaw(unorderedMapContract, "removeElement", { key: randomInt(COLLECTION_SIZE) });
  t.is(rRem.result.status.SuccessValue, "");
  logTotalGas("Remove element", rRem, t);
});

test("JS unordered set contract operations", async (t) => {
  const { ali, unorderedSetContract } = t.context.accounts;

  let rAdd;
  for (let i = 0; i < COLLECTION_SIZE; i++) {
    rAdd = await ali.callRaw(unorderedSetContract, "addElement", { value: i });
  }
  t.is(rAdd.result.status.SuccessValue, "");
  logTotalGas("Add element", rAdd, t);

  const rGet = await ali.callRaw(unorderedSetContract, "containsElement", { value: randomInt(COLLECTION_SIZE) });
  t.is(JSON.parse(Buffer.from(rGet.result.status.SuccessValue, "base64")), true);
  logTotalGas ("Get element", rGet, t);

  const rIt = await ali.callRaw(unorderedSetContract, "iterate", {});
  t.is(rIt.result.status.SuccessValue, "");
  logTotalGas("Iterate collection", rIt, t);

  const rRem = await ali.callRaw(unorderedSetContract, "removeElement", { value: randomInt(COLLECTION_SIZE) });
  t.is(rRem.result.status.SuccessValue, "");
  logTotalGas("Remove element", rRem, t);
});

test("JS vector contract operations", async (t) => {
  const { ali, vectorContract } = t.context.accounts;

  let rAdd;
  for (let i = 0; i < COLLECTION_SIZE; i++) {
    rAdd = await ali.callRaw(vectorContract, "addElement", { value: i });
  }
  t.is(rAdd.result.status.SuccessValue, "");
  logTotalGas("Add element", rAdd, t);

  const val = randomInt(COLLECTION_SIZE);
  const rGet = await ali.callRaw(vectorContract, "getElement", { index: val });
  t.is(JSON.parse(Buffer.from(rGet.result.status.SuccessValue, "base64")), val);
  logTotalGas("Get element", rGet, t);

  const rIt = await ali.callRaw(vectorContract, "iterate", {});
  t.is(rIt.result.status.SuccessValue, "");
  logTotalGas("Iterate collection", rIt, t);

  const rRem = await ali.callRaw(vectorContract, "removeElement", { index: randomInt(COLLECTION_SIZE) });
  t.is(rRem.result.status.SuccessValue, "");
  logTotalGas("Remove element", rRem, t);
});