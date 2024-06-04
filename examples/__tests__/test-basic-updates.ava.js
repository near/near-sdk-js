import {NEAR, Worker} from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
    const worker = await Worker.init();
    const root = worker.rootAccount;
    const contract = await root.devDeploy("./build/basic-updates-base.wasm");

    const ali = await root.createSubAccount("ali");

    t.context.worker = worker;
    t.context.accounts = { root, contract, ali };
});

test.afterEach.always(async (t) => {
    await t.context.worker.tearDown().catch((error) => {
        console.log("Failed to tear down the worker:", error);
    });
});

test("migration basic updates works", async (t) => {
    const { contract, ali } = t.context.accounts;

    await ali.call(contract, "add_message", { text: "hello" }, { attachedDeposit: NEAR.parse("1 N").toJSON() });
    let message0 = await contract.view("get_message", { index: 0 });
    let payment0 = await contract.view("get_payment", { index: 0 });
    console.log("message0= ", message0," payment0=", payment0)
    t.assert(
        message0.text === "hello" && message0.premium && message0.sender === ali.accountId
    );
    t.assert(payment0 == NEAR.parse("1 N"));

    await contract.deploy("./build/basic-updates-update.wasm");
    await ali.call(contract, "migrateState", {});

    let messageUpdated0 = await contract.view("get_message", { index: 0 });
    console.log("messageUpdated0= ", messageUpdated0);
    t.assert(
        message0.text === messageUpdated0.text && message0.premium === messageUpdated0.premium && message0.sender === messageUpdated0.sender && payment0 == messageUpdated0.payment
    );
});
