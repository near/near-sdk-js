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
    let contract_base64 = (await readFile('build/vector.base64')).toString();
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

test('Vector is empty by default', async t => {
    const { root, jsvm, testContract } = t.context.accounts;
    let result = await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {}));
    t.is(result, 0);
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        true
    );
});

test('Vector push, get, pop, replace', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'push', { value: 'hello' }), { attachedDeposit: '100000000000000000000000' });
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'push', { value: 'world' }), { attachedDeposit: '100000000000000000000000' });
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'push', { value: 'aaa' }), { attachedDeposit: '100000000000000000000000' });
    let result = await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {}));
    t.is(result, 3);
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get', { index: 0 })),
        'hello'
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get', { index: 2 })),
        'aaa'
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get', { index: 3 })),
        null
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'pop', {}));
    result = await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {}));
    t.is(result, 2);
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get', { index: 2 })),
        null
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get', { index: 1 })),
        'world'
    );
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'replace', { index: 1, value: 'aaa' }), { attachedDeposit: '100000000000000000000000' });
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'get', { index: 1 })),
        'aaa'
    );
});

test('Vector extend, toArray, swapRemove, clear', async t => {
    const { ali, jsvm, testContract } = t.context.accounts;

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'extend', { kvs: ['hello', 'world', 'aaa'] }), { attachedDeposit: '100000000000000000000000' });

    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['hello', 'world', 'aaa']
    );

    // swapRemove non existing element should error
    const error1 = await t.throwsAsync(() => ali.call(
        jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'swapRemove', { index: 3 })
    ));
    t.assert(error1.message.includes(`Index out of bounds`));
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['hello', 'world', 'aaa']
    );

    // swapRemove not the last one should work
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'swapRemove', { index: 0 }));
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['aaa', 'world']
    );

    // swapRemove the last one should work
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'swapRemove', { index: 1 }));
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        ['aaa']
    );

    // swapRemove when length is 1 should work
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'len', {})),
        1
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        false
    );
    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'swapRemove', { index: 0 }), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'toArray', {})),
        []
    );
    t.is(
        await jsvm.view('view_js_contract', encodeCall(testContract.accountId, 'isEmpty', {})),
        true
    );

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'extend', { kvs: ['hello', 'world', 'aaa'] }), { attachedDeposit: '100000000000000000000000' });
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