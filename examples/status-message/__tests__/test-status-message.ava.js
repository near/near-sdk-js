import { Worker } from 'near-workspaces';
import {readFile} from 'fs/promises'
import test from 'ava';

function encodeCall(contract, method, args) {
    return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
}

test.before(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the jsvm contract.
    const jsvm = await root.createAndDeploy(
        root.getSubAccount('jsvm').accountId,
        'build/jsvm.wasm',
    );

    // Deploy status-message JS contract
    const statusMessage = await root.createSubAccount('status-message');
    let contract_base64 = (await readFile('build/status-message.base64')).toString();
    await statusMessage.call(jsvm, 'deploy_js_contract', Buffer.from(contract_base64, 'base64'), {attachedDeposit: '400000000000000000000000'});
    await statusMessage.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'init', []), {attachedDeposit: '400000000000000000000000'});

    // Test users
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');
    const carl = await root.createSubAccount('carl');

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = { root, jsvm, statusMessage, ali, bob, carl };
});

test.after(async t => {
    // Stop Sandbox server
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to stop the Sandbox:', error);
    });
});

test('Root gets null status', async t => {
    const { root, jsvm, statusMessage } = t.context.accounts;
    const result = await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'get_status', [root.accountId]));
    t.is(result, '');
});

test('Ali sets then gets status', async t => {
    const { ali, jsvm, statusMessage } = t.context.accounts;
    await ali.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'set_status', ['hello']), {attachedDeposit: '100000000000000000000000'});
    
    t.is(
        await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'get_status', [ali.accountId])),
        'hello'
    );
});

test('Bob and Carl have different statuses', async t => {
    const {jsvm, statusMessage, bob, carl} = t.context.accounts;
    await bob.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'set_status', ['hello']), {attachedDeposit: '100000000000000000000000'});
    await carl.call(jsvm, 'call_js_contract', encodeCall(statusMessage.accountId, 'set_status', ['world']), {attachedDeposit: '100000000000000000000000'});

    const bobStatus = await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'get_status', [bob.accountId]));
    const carlStatus = await jsvm.view('view_js_contract', encodeCall(statusMessage.accountId, 'get_status', [carl.accountId]));
    t.is(bobStatus, 'hello');
    t.is(carlStatus, 'world');
  });
