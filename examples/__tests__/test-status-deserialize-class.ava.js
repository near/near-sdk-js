import {Worker} from "near-workspaces";
import test from "ava";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the contract.
  const statusMessage = await root.devDeploy("./build/status-deserialize-class.wasm");

  await root.call(statusMessage, "init_contract", {});
  const result = await statusMessage.view("is_contract_inited", {});
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
  await ali.call(statusMessage, "set_record", { message: "hello" });

  t.is(
    await statusMessage.view("get_record", { account_id: ali.accountId }),
    "hello"
  );
});

test("Ali set_truck_info and get_truck_info", async (t) => {
  const { ali, statusMessage } = t.context.accounts;
  let carName = "Mercedes-Benz";
  let speed = 240;
  await ali.call(statusMessage, "set_truck_info", { name: carName, speed: speed });

  await ali.call(statusMessage, "add_truck_load", { name: "alice", load: "a box" });
  await ali.call(statusMessage, "add_truck_load", { name: "bob", load: "a packet" });

  t.is(
      await statusMessage.view("get_truck_info", { }),
      carName + " run with speed " + speed + " with loads length: 2"
  );

  t.is(
      await statusMessage.view("get_user_car_info", { account_id: ali.accountId }),
      carName + " run with speed " + speed
  );
});

test("Ali push_message and get_messages", async (t) => {
  const { ali, statusMessage } = t.context.accounts;
  let message1 = 'Hello';
  let message2 = 'World';
  await ali.call(statusMessage, "push_message", { message: message1 });
  await ali.call(statusMessage, "push_message", { message: message2 });

  t.is(
      await statusMessage.view("get_messages", { }),
      'Hello,World'
  );
});

test.only("Ali set_nested_efficient_recordes then get_nested_efficient_recordes text", async (t) => {
  const { ali, bob, statusMessage } = t.context.accounts;
  await ali.call(statusMessage, "set_nested_efficient_recordes", { id: "1", message: "hello" }, { gas: 35_000_000_000_000n });
  await bob.call(statusMessage, "set_nested_efficient_recordes", { id: "1", message: "hello" }, { gas: 35_000_000_000_000n });
  await bob.call(statusMessage, "set_nested_efficient_recordes", { id: "2", message: "world" }, { gas: 35_000_000_000_000n });

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

  t.is(
      await statusMessage.view("get_nested_lookup_recordes", { id: "1", account_id: bob.accountId }),
      "hello"
  );

  t.is(
      await statusMessage.view("get_nested_lookup_recordes", { id: "2", account_id: bob.accountId }),
      "world"
  );

  t.is(
      await statusMessage.view("get_vector_nested_group", { idx: 0, account_id: bob.accountId }),
      "world"
  );

  t.is(
      await statusMessage.view("get_lookup_nested_vec", { account_id: bob.accountId, idx: 1 }),
      "world"
  );

  t.is(
      await statusMessage.view("get_is_contains_user", { account_id: bob.accountId}),
      true
  );
});

test("Ali set_big_num_and_date then gets", async (t) => {
  const { ali, bob, statusMessage } = t.context.accounts;
  await ali.call(statusMessage, "set_big_num_and_date", { bigint_num: `${10n}`, new_date: new Date('August 19, 2023 23:15:30 GMT+00:00') });


  const afterSetNum = await statusMessage.view("get_big_num", { });
  t.is(afterSetNum, `${10n}`);
  const afterSetDate =  await statusMessage.view("get_date", { });
  t.is(afterSetDate.toString(), '2023-08-19T23:15:30.000Z');
});

test("Ali set_extra_data without schema defined then gets", async (t) => {
  const { ali, statusMessage } = t.context.accounts;
  await ali.call(statusMessage, "set_extra_data", { message: "Hello world!", number: 100 });

  const messageWithoutSchemaDefined = await statusMessage.view("get_extra_msg", { });
  t.is(messageWithoutSchemaDefined, "Hello world!");
  const numberWithoutSchemaDefined =  await statusMessage.view("get_extra_number", { });
  t.is(numberWithoutSchemaDefined, 100);
});

test("Ali set_extra_record without schema defined then gets", async (t) => {
  const { ali, statusMessage } = t.context.accounts;
  await ali.call(statusMessage, "set_extra_record", { message: "Hello world!"});

  const recordWithoutSchemaDefined = await statusMessage.view("get_extra_record", { account_id: ali.accountId });
  t.is(recordWithoutSchemaDefined, "Hello world!");
});

test("View get_subtype_of_efficient_recordes", async (t) => {
  const { statusMessage } = t.context.accounts;

  t.is(
      await statusMessage.view("get_subtype_of_efficient_recordes", { }),
      'string'
  );
});

test("View get_subtype_of_nested_efficient_recordes", async (t) => {
  const { statusMessage } = t.context.accounts;

  t.is(
      JSON.stringify(await statusMessage.view("get_subtype_of_nested_efficient_recordes", { })),
      '{"collection":{"value":"string"}}'
  );
});