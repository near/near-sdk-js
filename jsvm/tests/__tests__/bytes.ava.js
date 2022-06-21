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
    let contract_base64 = (await readFile('build/bytes.base64')).toString();
    await testContract.call(jsvm, 'deploy_js_contract', Buffer.from(contract_base64, 'base64'), { attachedDeposit: '400000000000000000000000' });

    // Test users
    const ali = await root.createSubAccount('ali');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, jsvm, testContract, ali };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test('Log expected types work', async t => {
    const { jsvm, ali, testContract } = t.context.accounts;

    let r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'log_expected_input_tests', ''), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.logs,
        [
            "abc",
            "水",
            "333",
            '\x00\x01\xff',
            '\xe6\xb0\xb4',
            "水",
            "水"
        ]
    );
});

test('Log unexpected types not logging', async t => {
    const { jsvm, ali, testContract } = t.context.accounts;

    let r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'log_unexpected_input_tests', ''), { attachedDeposit: '100000000000000000000000' });
    // logUtf8 and logUtf16 only works with bytes, trying to log it with string is unexpected and behavior is undefined
    // in this specific case, it logs nothing
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.logs,
        [
            "",
            "",
        ]
    );
});

test('Log invalid utf-8 sequence panic', async t => {
    const { jsvm, ali, testContract } = t.context.accounts;

    let r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'log_invalid_utf8_sequence_test', ''), { attachedDeposit: '100000000000000000000000' });
    // console.log(JSON.stringify(r, null, 2))
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'String encoding is bad UTF-8 sequence.'
    );
});

test('Log invalid utf-16 sequence panic', async t => {
    const { jsvm, ali, testContract } = t.context.accounts;

    let r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'log_invalid_utf16_sequence_test', ''), { attachedDeposit: '100000000000000000000000' });
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'String encoding is bad UTF-16 sequence.'
    );
});

function encodeStateKey(k) {
    return Buffer.concat([Buffer.from('test-contract.test.near/state/'), Buffer.from(k)]).toString('base64')
}

test('storage write bytes tests', async t => {
    const { jsvm, ali, testContract } = t.context.accounts;

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'storage_write_bytes', ''), { attachedDeposit: '100000000000000000000000' });
    let stateMap = new Map()
    // viewState doesn't work, because it tries to convert key to utf-8 string, which is not
    let state = await jsvm.viewStateRaw()
    for (let {key, value} of state) {
        stateMap.set(key, value)
    }

    t.deepEqual(
        stateMap.get(encodeStateKey('abc')),
        Buffer.from('def').toString('base64')
    );
    t.deepEqual(
        stateMap.get(encodeStateKey([0x00, 0x01, 0xff])),
        Buffer.from([0xe6, 0xb0, 0xb4]).toString('base64')
    );
    t.deepEqual(
        stateMap.get(encodeStateKey([0xe6, 0xb0, 0xb4])),
        Buffer.from([0x00, 'a'.charCodeAt(0), 'b'.charCodeAt(0)]).toString('base64')
    );
});

test('storage write unexpected types tests', async t => {
    const { jsvm, ali, testContract } = t.context.accounts;

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'storage_write_unexpected_input', ''), { attachedDeposit: '100000000000000000000000' });
    let stateMap = new Map()
    // viewState doesn't work, because it tries to convert key to utf-8 string, which is not
    let state = await jsvm.viewStateRaw()
    for (let {key, value} of state) {
        stateMap.set(key, value)
    }
    console.log(await jsvm.viewState())

    t.deepEqual(
        stateMap.get(encodeStateKey('123')),
        Buffer.from('456').toString('base64')
    );
    // pass in utf-8 string instead of bytes, key and value become empty 
    t.deepEqual(
        stateMap.get(encodeStateKey([0xe6, 0xb0, 0xb4])),
        undefined
    );
    t.deepEqual(
        stateMap.get(encodeStateKey([])),
        ''
    );
});

test('Storage read bytes tests', async t => {
    const { jsvm, ali, testContract } = t.context.accounts;

    await ali.call(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'storage_write_bytes', ''), { attachedDeposit: '100000000000000000000000' });
    let r = await jsvm.viewRaw('view_js_contract', encodeCall(testContract.accountId, 'storage_read_ascii_bytes', ''))
    console.log(r)
    t.deepEqual(
        r.result,
        [100, 101, 102]
    );

    r = await jsvm.viewRaw('view_js_contract', encodeCall(testContract.accountId, 'storage_read_arbitrary_bytes_key_utf8_sequence_bytes_value', ''))
    t.deepEqual(
        r.result,
        [0xe6, 0xb0, 0xb4]
    );

    r = await jsvm.viewRaw('view_js_contract', encodeCall(testContract.accountId, 'storage_read_utf8_sequence_bytes_key_arbitrary_bytes_value', ''))
    t.deepEqual(
        r.result,
        [0x00, 'a'.charCodeAt(0), 'b'.charCodeAt(0)]
    );
});

test('panic tests', async t => {
    const { jsvm, ali, testContract } = t.context.accounts;
    let r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'panic_test', ''));
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'Smart contract panicked: explicit guest panic'
    );

    r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'panic_ascii_test', ''));
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'Smart contract panicked: abc'
    );

    r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'panic_js_number', ''));
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'Smart contract panicked: 356'
    );

    r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'panic_js_undefined', ''));
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'Smart contract panicked: explicit guest panic'
    );

    r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'panic_js_null', ''));
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'Smart contract panicked: null'
    );

    r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'panic_utf8_test', ''));
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'Smart contract panicked: 水'
    );

    r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'panicUtf8_valid_utf8_sequence', ''));
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'Smart contract panicked: 水'
    );

    r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'panicUtf8_invalid_utf8_sequence', ''));
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'String encoding is bad UTF-8 sequence.'
    );
})