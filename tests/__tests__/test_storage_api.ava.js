import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    // Use beforeEach instead of before to start from scratch state for each test
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the test contract.
    const storageApiContract = await root.devDeploy(
        'build/storage_api.wasm',
    );

    // Test users
    const ali = await root.createSubAccount('ali');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, storageApiContract, ali };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test('storage read write', async t => {
    const { ali, storageApiContract } = t.context.accounts;

    let exist = await ali.call(storageApiContract, 'test_storage_write', '');
    t.is(exist, false);
    let r = await storageApiContract.viewRaw('test_storage_read', '');
    t.deepEqual(r.result, [0, 1, 255]);
    exist = await ali.call(storageApiContract, 'test_storage_write', '');
    t.is(exist, true);
});

test('storage remove', async t => {
    const { ali, storageApiContract } = t.context.accounts;
    let hasKey = await storageApiContract.view('test_storage_has_key', '');
    t.is(hasKey, false);
    let exist = await ali.call(storageApiContract, 'test_storage_remove', '');
    t.is(exist, false);
    
    await ali.call(storageApiContract, 'test_storage_write', '');

    hasKey = await storageApiContract.view('test_storage_has_key', '');
    t.is(hasKey, true);
    exist = await ali.call(storageApiContract, 'test_storage_remove', '');
    t.is(exist, true);
})


test('storage get evicted', async t => {
    const { ali, storageApiContract } = t.context.accounts;

    let r = await ali.callRaw(storageApiContract, 'test_storage_get_evicted', '');
    console.log(JSON.stringify(r,null,2))
    t.deepEqual(Buffer.from(r.result.status.SuccessValue, 'base64'), Buffer.from([0, 1, 255]));
});