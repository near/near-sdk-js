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
        '../res/jsvm.wasm',
    );

    // Deploy test JS contract
    const testContract = await root.createSubAccount('test-contract');
    let contract_base64 = (await readFile('build/lookup-set.base64')).toString();
    await testContract.call(jsvm, 'deploy_js_contract', Buffer.from(contract_base64, 'base64'), { attachedDeposit: '400000000000000000000000' });
    await testContract.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'init', []), { attachedDeposit: '400000000000000000000000' });

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

test('LookupSet set() contains()', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'contains', { key: 'hello' })),
        false
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { key: 'hello' }), { attachedDeposit: '100000000000000000000000' });

    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'contains', { key: 'hello' })),
        true
    );
});


test('LookupSet remove', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { key: 'hello' }), { attachedDeposit: '100000000000000000000000' });
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { key: 'hello1' }), { attachedDeposit: '100000000000000000000000' });

    // remove non existing element should not error
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { key: 'hello3' }), { attachedDeposit: '100000000000000000000000' });
    // remove existing key should work
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { key: 'hello1' }));
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'contains', { key: 'hello1' })),
        false
    );
    // not removed key should not affected
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'contains', { key: 'hello' })),
        true
    );
});

test('LookupSet extend', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'extend', { keys: ['hello', 'world', 'hello1'] }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'contains', { key: 'hello' })),
        true
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'contains', { key: 'hello1' })),
        true
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'contains', { key: 'world' })),
        true
    );
})