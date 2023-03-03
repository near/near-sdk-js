import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
    const worker = await Worker.init();
    const root = worker.rootAccount;
    const contract = await root.devDeploy("./build/state-migration.wasm");

    const ali = await root.createSubAccount("ali");

    t.context.worker = worker;
    t.context.accounts = { root, contract, ali };
});

test.afterEach.always(async (t) => {
    await t.context.worker.tearDown().catch((error) => {
        console.log("Failed to tear down the worker:", error);
    });
});

test("migration works", async (t) => {
    const { contract, ali } = t.context.accounts;

    await ali.call(contract, "addMessage", { message: { sender: "ali", header: "h1", text: "hello" } });
    await ali.call(contract, "addMessage", { message: { sender: "ali", header: "h2", text: "world" } });
    await ali.call(contract, "addMessage", { message: { sender: "ali", header: "h3", text: "This message is too log for new standard" } });
    await ali.call(contract, "addMessage", { message: { sender: "ali", header: "h4", text: "!" } });

    const res1 = await contract.view("countMessages", {});
    t.is(res1, 4);

    await ali.call(contract, "migrateState", {});

    const res2 = await contract.view("countMessages", {});
    t.is(res2, 3);
});
