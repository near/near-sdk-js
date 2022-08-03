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
    const jsvm = await root.devDeploy(
        '../../jsvm/build/jsvm.wasm',
    );

    // Deploy test JS contract
    const testContract = await root.createSubAccount('test-contract');
    let contract_base64 = (await readFile('build/unordered-set.base64')).toString();
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

test('UnorderedSet is empty by default', async t => {
    const { root, jsvm, testContract } = t.context.accounts;
    const result = await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {}));
    t.is(result, 0);
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        true
    );
});

test('UnorderedSet set() contains()', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'contains', { element: 'hello' })),
        false
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { element: 'hello' }), { attachedDeposit: '100000000000000000000000' });

    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'contains', { element: 'hello' })),
        true
    );
});


test('UnorderedSet insert, len and iterate', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;

    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        0
    );
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        []
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { element: 'hello' }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        1
    );
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { element: 'hello1' }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        2
    );

    // insert the same value, len shouldn't change
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'set', { element: 'hello1' }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        2
    );

    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['hello', 'hello1']
    );
});

test('UnorderedSet extend, remove, clear', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'extend', { elements: ['hello', 'world', 'hello1'] }), { attachedDeposit: '100000000000000000000000' });

    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['hello', 'world', 'hello1']
    );

    // remove non existing element should not error
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { element: 'hello3' }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['hello', 'world', 'hello1']
    );

    // remove not the last one should work
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { element: 'hello' }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['hello1', 'world']
    );

    // remove the last one should work
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { element: 'world' }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['hello1']
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
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'remove', { element: 'hello1' }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        []
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        true
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'extend', { elements: ['hello', 'world', 'hello1'] }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['hello', 'world', 'hello1']
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        false
    );
    // clear should work
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