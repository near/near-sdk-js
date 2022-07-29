import { Worker } from 'near-workspaces';
import { readFile } from 'fs/promises'
import test from 'ava';

function encodeCall(contract, method, args) {
    return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
}

test.before(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the test contract.
    const functionParamsContract = await root.devDeploy(
        'build/function-params.wasm',
    );
    await functionParamsContract.call(functionParamsContract, 'init', {});

    // Test users
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');
    const carl = await root.createSubAccount('carl');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, functionParamsContract, ali, bob, carl };
});

test.after(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('get current account id correct', async t => {
    const { ali, functionParamsContract } = t.context.accounts;
    await ali.call(functionParamsContract, 'set_values', { param1: 'newVal1', param2: 'newVal2', param3: 'newVal3' });
    let values = await functionParamsContract.view('get_values', '');
    t.deepEqual(values,  { val3: 'newVal3', val2: 'newVal2', val1: 'newVal1' });
});
