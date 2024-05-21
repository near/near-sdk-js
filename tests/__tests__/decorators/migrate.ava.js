import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  const worker = await Worker.init();
  const root = worker.rootAccount;
  const counter = await root.devDeploy("./build/migrate.wasm");

  const ali = await root.createSubAccount("ali");

  t.context.worker = worker;
  t.context.accounts = { root, counter, ali };
});

// If the environment is reused, use test.after to replace test.afterEach
test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("migration works", async (t) => {
  const { counter, ali } = t.context.accounts;

  const res1 = await counter.view("getCount", {});
  t.is(res1, 0);

  await ali.call(counter, "increase", {});

  const res2 = await counter.view("getCount", {});
  t.is(res2, 1);

  const migrationRes = await ali.callRaw(counter, "migrFuncValueTo18", {});

  t.is(JSON.stringify(migrationRes).includes("Count: 0"), true);

  const res3 = await counter.view("getCount", {});
  t.is(res3, 18);
});
