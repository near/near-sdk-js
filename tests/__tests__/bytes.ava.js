import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the test contract.
    const bytesContract = await root.devDeploy(
        'build/bytes.wasm',
    );
    // Test users
    const ali = await root.createSubAccount('ali');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, bytesContract, ali };
});

test.afterEach.always(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test('Log expected types work', async t => {
    const { ali, bytesContract } = t.context.accounts;

    let r = await ali.callRaw(bytesContract, 'log_expected_input_tests', '');
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
    const { ali, bytesContract } = t.context.accounts;

    let r = await ali.callRaw(bytesContract, 'log_unexpected_input_tests', '');
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
    const { ali, bytesContract } = t.context.accounts;

    let r = await ali.callRaw(bytesContract, 'log_invalid_utf8_sequence_test', '');
    // console.log(JSON.stringify(r, null, 2))
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'String encoding is bad UTF-8 sequence.'
    );
});

test('Log invalid utf-16 sequence panic', async t => {
    const { ali, bytesContract } = t.context.accounts;

    let r = await ali.callRaw(bytesContract, 'log_invalid_utf16_sequence_test', '');
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'String encoding is bad UTF-16 sequence.'
    );
});

function encodeStateKey(k) {
    return Buffer.from(k).toString('base64')
}

test('storage write bytes tests', async t => {
    const { ali, bytesContract } = t.context.accounts;

    await ali.call(bytesContract, 'storage_write_bytes', '');
    let stateMap = new Map()
    // viewState doesn't work, because it tries to convert key to utf-8 string, which is not. So we use viewStateRaw
    let state = await bytesContract.viewStateRaw()
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
    const { ali, bytesContract } = t.context.accounts;

    await ali.call(bytesContract, 'storage_write_unexpected_input', '');
    let stateMap = new Map()
    // viewState doesn't work, because it tries to convert key to utf-8 string, which is not
    let state = await bytesContract.viewStateRaw()
    for (let {key, value} of state) {
        stateMap.set(key, value)
    }

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
    const { ali, bytesContract } = t.context.accounts;

    await ali.call(bytesContract, 'storage_write_bytes', '');
    let r = await bytesContract.viewRaw('storage_read_ascii_bytes', '');
    console.log(r)
    t.deepEqual(
        r.result,
        [100, 101, 102]
    );

    r = await bytesContract.viewRaw('storage_read_arbitrary_bytes_key_utf8_sequence_bytes_value', '');
    t.deepEqual(
        r.result,
        [0xe6, 0xb0, 0xb4]
    );

    r = await bytesContract.viewRaw('storage_read_utf8_sequence_bytes_key_arbitrary_bytes_value', '');
    t.deepEqual(
        r.result,
        [0x00, 'a'.charCodeAt(0), 'b'.charCodeAt(0)]
    );
});

test('panic tests', async t => {
    const { ali, bytesContract } = t.context.accounts;
    let r = await ali.callRaw(bytesContract, 'panic_test', '');
    t.assert(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError
        .match(/Smart contract panicked:*/)
    );

    r = await ali.callRaw(bytesContract, 'panic_ascii_test', '');
    t.assert(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError
        .match(/Smart contract panicked: abc*/)
    );

    r = await ali.callRaw(bytesContract, 'panic_js_number', '');
    t.assert(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError
        .match(/Smart contract panicked: 356*/)
    );

    r = await ali.callRaw(bytesContract, 'panic_js_undefined', '');
    t.assert(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError
        .match(/Smart contract panicked:*/)
    );

    r = await ali.callRaw(bytesContract, 'panic_js_null', '');
    t.assert(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError
        .match(/Smart contract panicked: null*/)
    );

    r = await ali.callRaw(bytesContract, 'panic_utf8_test', '');
    t.assert(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError
        .match(/Smart contract panicked: 水*/)
    );

    r = await ali.callRaw(bytesContract, 'panicUtf8_valid_utf8_sequence', '');
    t.assert(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError
        .match(/Smart contract panicked: 水*/)
    );

    r = await ali.callRaw(bytesContract, 'panicUtf8_invalid_utf8_sequence', '');
    t.deepEqual(
        r.result.receipts_outcome[0].outcome.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
        'String encoding is bad UTF-8 sequence.'
    );
})