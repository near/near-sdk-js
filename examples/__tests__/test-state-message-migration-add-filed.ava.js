import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
    const worker = await Worker.init();
    const root = worker.rootAccount;
    const contract = await root.devDeploy("./build/status-message.wasm");

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

    await ali.call(contract, "set_status", { message: "hello" });
    t.is(
        await contract.view("get_status", { account_id: ali.accountId }),
        "hello"
    );

    await contract.deploy("./build/status-message-migrate-add-field.wasm");
    await ali.call(contract, "migrateState", {});

    t.is(
        await contract.view("get_status", { account_id: ali.accountId }),
        "hello"
    );

    await ali.call(contract, "set_new_status", { message: "hello" });
    t.is(
        await contract.view("get_new_status", { account_id: ali.accountId }),
        "hello"
    );
});
