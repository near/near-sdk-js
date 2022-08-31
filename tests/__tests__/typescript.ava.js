import { Worker } from 'near-workspaces';
import test from 'ava';

test.before(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the test contract.
    const typescriptContract = await root.devDeploy(
        'build/typescript.wasm',
    );
    // Test users
    const ali = await root.createSubAccount('ali');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, typescriptContract, ali };
});

test.after(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test('bigint', async t => {
    const { typescriptContract } = t.context.accounts;
    let r = await typescriptContract.view('bigint', '');
    t.is(r, "3");
});
