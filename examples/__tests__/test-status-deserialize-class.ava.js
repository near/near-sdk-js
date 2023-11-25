import {BN, Worker} from "near-workspaces";
import test from "ava";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the contract.
  const statusMessage = await root.devDeploy("./build/status-deserialize-class.wasm");

  await root.call(statusMessage, "init_messages", {}, {gas: new BN(200 * 10**12)});
  const result = await statusMessage.view("is_message_inited", {});
  t.is(result, true);
  // Create test users
  const ali = await root.createSubAccount("ali");
  const bob = await root.createSubAccount("bob");
  const carl = await root.createSubAccount("carl");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, statusMessage, ali, bob, carl };
});

test.after.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("Ali sets then gets status", async (t) => {
  const { ali, statusMessage } = t.context.accounts;
  await ali.call(statusMessage, "set_record", { message: "hello" }, {gas: new BN(200 * 10**12)});

  t.is(
    await statusMessage.view("get_record", { account_id: ali.accountId }),
    "hello"
  );
});

test("Ali set_car_info and get_car_info", async (t) => {
  const { ali, statusMessage } = t.context.accounts;
  let carName = "Mercedes-Benz";
  let speed = 240;
  await ali.call(statusMessage, "set_car_info", { name: carName, speed: speed }, {gas: new BN(200 * 10**12)});

  t.is(
      await statusMessage.view("get_car_info", { }),
      carName + " run with speed " + speed
  );
});

test("Ali push_message and get_messages", async (t) => {
  const { ali, statusMessage } = t.context.accounts;
  let message1 = 'Hello';
  let message2 = 'World';
  await ali.call(statusMessage, "push_message", { message: message1 }, {gas: new BN(200 * 10**12)});
  await ali.call(statusMessage, "push_message", { message: message2 }, {gas: new BN(200 * 10**12)});

  t.is(
      await statusMessage.view("get_messages", { }),
      'Hello,World'
  );
});

test("Ali set_nested_efficient_recordes then get_nested_efficient_recordes text", async (t) => {
  const { ali, bob, statusMessage } = t.context.accounts;
  await ali.call(statusMessage, "set_nested_efficient_recordes", { id: "1", message: "hello" }, {gas: new BN(200 * 10**12)});
  await bob.call(statusMessage, "set_nested_efficient_recordes", { id: "1", message: "hello" }, {gas: new BN(200 * 10**12)});
  await bob.call(statusMessage, "set_nested_efficient_recordes", { id: "2", message: "world" }, {gas: new BN(200 * 10**12)});

  t.is(
      await statusMessage.view("get_efficient_recordes", { account_id: ali.accountId }),
      "hello"
  );

  t.is(
      await statusMessage.view("get_nested_efficient_recordes", { id: "1", account_id: bob.accountId }),
      "hello"
  );

  t.is(
      await statusMessage.view("get_nested_efficient_recordes", { id: "2", account_id: bob.accountId }),
      "world"
  );
});