import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the statis-message contract.
  const statusMessage = await root.devDeploy(
    "./build/status-message-collections.wasm"
  );

  // Test users
  const ali = await root.createSubAccount("ali");
  const bob = await root.createSubAccount("bob");
  const carl = await root.createSubAccount("carl");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, statusMessage, ali, bob, carl };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("Root gets null status", async (t) => {
  const { root, statusMessage } = t.context.accounts;
  const result = await statusMessage.view("get_status", {
    account_id: root.accountId,
  });
  t.is(result, null);
});

test("Ali sets then gets status", async (t) => {
  const { ali, statusMessage } = t.context.accounts;
  await ali.call(statusMessage, "set_status", { message: "hello" });

  t.is(
    await statusMessage.view("get_status", { account_id: ali.accountId }),
    "hello"
  );
});

test("Bob and Carl have different statuses", async (t) => {
  const { statusMessage, bob, carl } = t.context.accounts;
  await bob.call(statusMessage, "set_status", { message: "hello" });
  await carl.call(statusMessage, "set_status", { message: "world" });

  const bobStatus = await statusMessage.view("get_status", {
    account_id: bob.accountId,
  });
  const carlStatus = await statusMessage.view("get_status", {
    account_id: carl.accountId,
  });
  t.is(bobStatus, "hello");
  t.is(carlStatus, "world");
});

test("Get statuses from the contract", async (t) => {
  const { statusMessage, bob, carl } = t.context.accounts;
  await bob.call(statusMessage, "set_status", { message: "hello" });
  await carl.call(statusMessage, "set_status", { message: "world" });

  const statuses = await statusMessage.view("get_all_statuses", {});
  t.deepEqual(statuses, [
    [bob.accountId, "hello"],
    [carl.accountId, "world"],
  ]);
});

test("message has stored by someone", async (t) => {
  const { ali, statusMessage } = t.context.accounts;
  await ali.call(statusMessage, "set_status", { message: "hello" });

  t.is(await statusMessage.view("has_status", { message: "hello" }), true);

  t.is(await statusMessage.view("has_status", { message: "world" }), false);
});
