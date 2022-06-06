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
        './node_modules/near-sdk-js/res/jsvm.wasm',
    );

    // Deploy status-message JS contract
    const statusMessage = await root.createSubAccount('status-message');
    let contract_base64 = (await readFile('build/status-message-collections.base64')).toString();
    await statusMessage.call(jsvm, 'deploy_js_contract', Buffer.from(contract_base64, 'base64'), { attachedDeposit: '400000000000000000000000' });
    await statusMessage.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'init', []), { attachedDeposit: '400000000000000000000000' });

    // Test users
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');
    const carl = await root.createSubAccount('carl');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, jsvm, statusMessage, ali, bob, carl };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('Root gets null status', async t => {
    const { root, jsvm, statusMessage } = t.context.accounts;
    const result = await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'get_status', { account_id: root.accountId }));
    t.is(result, null);
});

test('Ali sets then gets status', async t => {
    const { ali, jsvm, statusMessage } = t.context.accounts;
    await ali.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'set_status', { message: 'hello' }), { attachedDeposit: '100000000000000000000000' });

    t.is(
        await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'get_status', { account_id: ali.accountId })),
        'hello'
    );
});

test('Bob and Carl have different statuses', async t => {
    const { jsvm, statusMessage, bob, carl } = t.context.accounts;
    await bob.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'set_status', { message: 'hello' }), { attachedDeposit: '100000000000000000000000' });
    await carl.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'set_status', { message: 'world' }), { attachedDeposit: '100000000000000000000000' });

    const bobStatus = await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'get_status', { account_id: bob.accountId }));
    const carlStatus = await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'get_status', { account_id: carl.accountId }));
    t.is(bobStatus, 'hello');
    t.is(carlStatus, 'world');
});

test('Get statuses from the contract', async t => {
    const { jsvm, statusMessage, bob, carl } = t.context.accounts;
    await bob.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'set_status', { message: 'hello' }), { attachedDeposit: '100000000000000000000000' });
    await carl.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'set_status', { message: 'world' }), { attachedDeposit: '100000000000000000000000' });

    const statuses = await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'get_all_statuses', {}));
    t.deepEqual(statuses, [[bob.accountId, 'hello'], [carl.accountId, 'world']]);
});

test('message has stored by someone', async t => {
    const { ali, jsvm, statusMessage } = t.context.accounts;
    await ali.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'set_status', { message: 'hello' }), { attachedDeposit: '100000000000000000000000' });

    t.is(
        await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'has_status', { message: 'hello' })),
        true
    );

    t.is(
        await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'has_status', { message: 'world' })),
        false
    );
});