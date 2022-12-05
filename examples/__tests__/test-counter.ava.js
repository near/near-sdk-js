import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etc.
  const root = worker.rootAccount;

  let counterContract;

  switch (process.env.COUNTER_CONTRACT_TYPE) {
    case "COUNTER_LOW_LEVEL": {
      counterContract = "./build/counter-lowlevel.wasm";
      break;
    }
    case "COUNTER_TS": {
      counterContract = "./build/counter-ts.wasm";
      break;
    }
    case "COUNTER_JS": {
      counterContract = "./build/counter.wasm";
      break;
    }
    case "COUNTER_EXTENDED": {
      counterContract = "./build/counter-extended.wasm";
      break;
    }
    default:
      throw Error("Unknown COUNTER_CONTRACT_TYPE");
  }

  // Deploy the counter contract.
  const counter = await root.devDeploy(counterContract);

  // Test users
  const ali = await root.createSubAccount("ali");
  const bob = await root.createSubAccount("bob");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, counter, ali, bob };
});

// If the environment is reused, use test.after to replace test.afterEach
test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("Initial count is 0", async (t) => {
  const { counter } = t.context.accounts;
  const result = await counter.view("getCount", {});
  t.is(result, 0);
});

test("Increase works", async (t) => {
  const { counter, ali, bob } = t.context.accounts;
  await ali.call(counter, "increase", {});

  let result = await counter.view("getCount", {});
  t.is(result, 1);

  await bob.call(counter, "increase", { n: 4 });
  result = await counter.view("getCount", {});
  t.is(result, 5);
});

test("Decrease works", async (t) => {
  const { counter, ali, bob } = t.context.accounts;
  await ali.call(counter, "decrease", {});

  let result = await counter.view("getCount", {});
  t.is(result, -1);

  let dec = await bob.callRaw(counter, "decrease", { n: 4 });
  // ensure imported log does work, not silent failure
  t.is(
    dec.result.receipts_outcome[0].outcome.logs[0],
    "Counter decreased to -5"
  );
  result = await counter.view("getCount", {});
  t.is(result, -5);
});
