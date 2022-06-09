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

test('Log unexpected types work', async t => {
    const { jsvm, ali, testContract } = t.context.accounts;

    let r = await ali.callRaw(jsvm, 'call_js_contract', encodeCall(testContract.accountId, 'log_unexpected_input_tests', ''), { attachedDeposit: '100000000000000000000000' });
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