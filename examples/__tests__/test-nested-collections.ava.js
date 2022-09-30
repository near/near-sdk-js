import { Worker } from "near-workspaces";
import test from "ava";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the contract.
  const nestedCollections = await root.devDeploy(
    "./build/nested-collections.wasm"
  );

  // Create test users
  const ali = await root.createSubAccount("ali");
  const bob = await root.createSubAccount("bob");
  const carl = await root.createSubAccount("carl");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, nestedCollections, ali, bob, carl };
});

test.after.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("Ali sets then gets text", async (t) => {
  const { ali, nestedCollections } = t.context.accounts;
  await ali.call(nestedCollections, "add", { id: "1", text: "hello" });
  await ali.call(nestedCollections, "add", { id: "2", text: "world" });

  t.is(
    await nestedCollections.view("get", { id: "1", accountId: ali.accountId }),
    "hello"
  );

  t.is(
    await nestedCollections.view("get", { id: "2", accountId: ali.accountId }),
    "world"
  );
});

test("Bob and Carl have different statuses", async (t) => {
  const { nestedCollections, bob, carl } = t.context.accounts;
  await bob.call(nestedCollections, "add", { id: "1", text: "hello" });
  await carl.call(nestedCollections, "add", { id: "1", text: "world" });

  t.is(
    await nestedCollections.view("get", { id: "1", accountId: bob.accountId }),
    "hello"
  );

  t.is(
    await nestedCollections.view("get", { id: "1", accountId: carl.accountId }),
    "world"
  );
});

test("sets then gets nested nested collection", async (t) => {
  const { ali, bob, nestedCollections } = t.context.accounts;
  await ali.call(nestedCollections, "add_to_group", {
    group: "x",
    id: "1",
    text: "hello",
  });
  await ali.call(nestedCollections, "add_to_group", {
    group: "x",
    id: "2",
    text: "world",
  });
  await ali.call(nestedCollections, "add_to_group", {
    group: "y",
    id: "2",
    text: "cat",
  });
  await bob.call(nestedCollections, "add_to_group", {
    group: "y",
    id: "2",
    text: "dog",
  });

  t.is(
    await nestedCollections.view("get_from_group", {
      group: "x",
      id: "1",
      accountId: ali.accountId,
    }),
    "hello"
  );

  t.is(
    await nestedCollections.view("get_from_group", {
      group: "x",
      id: "2",
      accountId: ali.accountId,
    }),
    "world"
  );

  t.is(
    await nestedCollections.view("get_from_group", {
      group: "y",
      id: "2",
      accountId: ali.accountId,
    }),
    "cat"
  );

  t.is(
    await nestedCollections.view("get_from_group", {
      group: "y",
      id: "2",
      accountId: bob.accountId,
    }),
    "dog"
  );
});
