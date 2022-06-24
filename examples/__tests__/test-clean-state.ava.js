import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the clearn-state contract.
    const clearnState = await root.createAndDeploy(
        root.getSubAccount('clearn-state').accountId,
        './build/clearn-state.wasm',
    );

    // Init the contract
    await clearnState.call(clearnState, 'init', {});

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = {
        root,
        clearnState,
    };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed tear down the worker:', error);
    });
});

test('Clean state after storing', async t => {
    const { root, clearnState } = t.context.accounts;
    await root.call(clearnState, 'put', { key: '1', value: 1 });
    const value1 = await clearnState.view('get', { key: '1' });
    t.is(value1, '1');
    await cleanStateContract.call(clearnState, 'clean', { keys: ['1'] });
    const value2 = await clearnState.view('get', { key: '1' });
    t.is(value2, null);
});
