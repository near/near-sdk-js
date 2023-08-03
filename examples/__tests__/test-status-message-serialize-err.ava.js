import { Worker } from "near-workspaces";
import test from "ava";

test.before(async (t) => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the contract.
    const statusMessage = await root.devDeploy("./build/status-message-serialize-err.wasm");

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

test("Root gets null status", async (t) => {
    const { statusMessage, root } = t.context.accounts;
    const result = await statusMessage.view("get_status", {
        account_id: root.accountId,
    });
    t.is(result, null);
});

test("Ali sets status", async (t) => {
    const { ali, statusMessage } = t.context.accounts;
    let res = await ali.callRaw(statusMessage, "set_status", { message: "hello" });

    t.assert(
        res.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes(
            "Smart contract panicked: serialize err"
        )
    );
});
