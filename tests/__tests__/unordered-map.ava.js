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
    let contract_base64 = (await readFile('build/unordered-map.base64')).toString();
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

test('UnorderedMap is empty by default', async t => {
    const { root, jsvm, testContract } = t.context.accounts;
    const result = await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {}));
    t.is(result, 0);
});

test('UnorderedMap set() get()', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get', { key: 'hello' })),
        null
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { key: 'hello', value: 'world' }), { attachedDeposit: '100000000000000000000000' });

    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get', { key: 'hello' })),
        'world'
    );
});


test('UnorderedMap insert, update, len and iterate', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;

    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        0
    );
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        []
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { key: 'hello', value: 'world' }), { attachedDeposit: '100000000000000000000000' });
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { key: 'hello1', value: 'world0' }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        2
    );

    // update a value, len shouldn't change
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { key: 'hello1', value: 'world1' }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        2
    );
    // update should have effect
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get', { key: 'hello1' })),
        'world1'
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { key: 'hello2', value: 'world2' }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        3
    );

    // Try to set a key with same value, len shouldn't change
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { key: 'hello2', value: 'world2' }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        3
    );

    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']]
    );
});

test('UnorderedMap extend, remove, clear', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'extend', { kvs: [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']] }), { attachedDeposit: '100000000000000000000000' });

    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']]
    );

    // remove non existing element should not error
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { key: 'hello3' }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']]
    );

    // remove not the last one should work
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { key: 'hello' }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        [['hello2', 'world2'], ['hello1', 'world1']]
    );

    // remove the last one should work
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { key: 'hello1' }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        [['hello2', 'world2']]
    );

    // remove when length is 1 should work
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        1
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        false
    );
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { key: 'hello2' }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        []
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        true
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'extend', { kvs: [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']] }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        false
    );
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'clear', {}), { attachedDeposit: '100000000000000000000000' });

    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        []
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        true
    );
})