import { Worker, NEAR } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  const worker = await Worker.init();
  const root = worker.rootAccount;

  const xccLoop = await root.createSubAccount("xcc-loop");
  await xccLoop.deploy("./build/cross-contract-call-loop.wasm");

  const firstContract = await root.createSubAccount("first-contract");
  const secondContract = await root.createSubAccount("second-contract");
  const thirdContract = await root.createSubAccount("third-contract");
  await firstContract.deploy("./build/counter.wasm");
  await secondContract.deploy("./build/counter.wasm");
  await thirdContract.deploy("./build/counter.wasm");

  await root.call(firstContract, "increase", {});
  await root.call(secondContract, "increase", {});
  await root.call(thirdContract, "increase", {});

  const alice = await root.createSubAccount("alice", {
    initialBalance: NEAR.parse("100 N").toJSON(),
  });

  t.context.worker = worker;
  t.context.accounts = { root, alice, xccLoop };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("should have a count of 3 after calling incrementCount", async (t) => {
  const { xccLoop, alice } = t.context.accounts;
  await alice.call(
    xccLoop,
    "incrementCount",
    {},
    { gas: "300" + "0".repeat(12) }
  );
  const result = await xccLoop.view("getCount");
  const expected = 3;
  t.deepEqual(result, expected);
});
