import { Worker } from 'near-workspaces';
import { readFile } from 'fs/promises'
import test from 'ava';

function encodeCall(contract, method, args) {
    return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
}

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the jsvm contract.
    const jsvm = await root.createAndDeploy(
        root.getSubAccount('jsvm').accountId,
        '../../jsvm/build/jsvm.wasm',
    );

    // Deploy test JS contract
    const testContract = await root.createSubAccount('test-contract');
    let contract_base64 = (await readFile('build/function-params.base64')).toString();
    await testContract.call(jsvm, 'deploy_js_contract', Buffer.from(contract_base64, 'base64'), { attachedDeposit: '400000000000000000000000' });
    await testContract.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'init', {}), { attachedDeposit: '400000000000000000000000' });

    // Test users
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');
    const carl = await root.createSubAccount('carl');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, jsvm, testContract, ali, bob, carl };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test('Developer can pass parameters as dictionary', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set_values', { param1: 'newVal1', param2: 'newVal2', param3: 'newVal3' }), { attachedDeposit: '100000000000000000000000' });

    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get_values', {})),
        { val3: 'newVal3', val2: 'newVal2', val1: 'newVal1' }
    );
});
