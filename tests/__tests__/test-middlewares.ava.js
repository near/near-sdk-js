import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the contract.
  const middlewares = await root.createSubAccount("middlewares-contract");
  await middlewares.deploy("build/middlewares.wasm");

  // Create the init args.
  const args = JSON.stringify({ randomData: "anything" });
  // Capture the result of the init function call.
  const result = await middlewares.callRaw(middlewares, "init", args);

  // Extract the logs.
  const { logs } = result.result.receipts_outcome[0].outcome;
  // Create the expected logs.
  const expectedLogs = [`Log from middleware: ${args}`];

  // Check for correct logs.
  t.deepEqual(logs, expectedLogs);

  // Create test users
  const ali = await root.createSubAccount("ali");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, middlewares, ali };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("The middleware logs with call functions", async (t) => {
  const { ali, middlewares } = t.context.accounts;

  // Create the arguments which will be passed to the function.
  const args = JSON.stringify({ id: "1", text: "hello" });
  // Call the function.
  const result = await ali.callRaw(middlewares, "add", args);
  // Extract the logs.
  const { logs } = result.result.receipts_outcome[0].outcome;
  // Create the expected logs.
  const expectedLogs = [`Log from middleware: ${args}`];

  t.deepEqual(logs, expectedLogs);
});

test("The middleware logs with view functions", async (t) => {
  const { ali, middlewares } = t.context.accounts;

  // Create the arguments which will be passed to the function.
  const args = JSON.stringify({ id: "1", accountId: "hello" });
  // Call the function.
  const result = await ali.callRaw(middlewares, "get", args);
  // Extract the logs.
  const { logs } = result.result.receipts_outcome[0].outcome;
  // Create the expected logs.
  const expectedLogs = [`Log from middleware: ${args}`];

  t.deepEqual(logs, expectedLogs);
});

test("The middleware logs with two middleware functions", async (t) => {
  const { ali, middlewares } = t.context.accounts;

  // Create the arguments which will be passed to the function.
  const args = JSON.stringify({ id: "1", accountId: "hello" });
  // Call the function.
  const result = await ali.callRaw(middlewares, "get_two", args);
  // Extract the logs.
  const { logs } = result.result.receipts_outcome[0].outcome;
  // Create the expected logs.
  const expectedLogs = [`Log from middleware: ${args}`, "Second log!"];

  t.deepEqual(logs, expectedLogs);
});

test("The middleware logs with private functions", async (t) => {
  const { ali, middlewares } = t.context.accounts;

  // Create the arguments which will be passed to the function.
  const args = { id: "test", accountId: "tset" };
  // Call the function.
  const result = await ali.callRaw(middlewares, "get_private", "");
  // Extract the logs.
  const { logs } = result.result.receipts_outcome[0].outcome;
  // Create the expected logs.
  const expectedLogs = [`Log from middleware: ${args}`];

  t.deepEqual(logs, expectedLogs);
});
