import { Worker } from 'near-workspaces';
import { readFile } from 'fs/promises'
import test from 'ava';

// TODO: make this function part of the npm package when it is available
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
    const statusMessageContract = await root.createSubAccount('status-message');
    let statusContractBase64 = (await readFile('res/status-message.base64')).toString();
    await statusMessageContract.call(jsvm, 'deploy_js_contract', Buffer.from(statusContractBase64, 'base64'), { attachedDeposit: '400000000000000000000000' });
    await statusMessageContract.call(jsvm, 'call_js_contract', encodeCall(statusMessageContract.accountId, 'init', {}), { attachedDeposit: '400000000000000000000000' });

    // Deploy on-call contrat
    const onCallContract = await root.createSubAccount('on-call');
    let cross_cc_contract_base64 = (await readFile('build/contract.base64')).toString();
    await onCallContract.call(jsvm, 'deploy_js_contract', Buffer.from(cross_cc_contract_base64, 'base64'), { attachedDeposit: '400000000000000000000000' });
    await onCallContract.call(jsvm, 'call_js_contract', encodeCall(onCallContract.accountId, 'init', {}), { attachedDeposit: '400000000000000000000000' });

    // Create test accounts
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = {
        root,
        jsvm,
        statusMessageContract,
        onCallContract,
        ali,
        bob,
    };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed tear down the worker:', error);
    });
});

test('Nobody is on-call in the beginning', async t => {
    const { jsvm, onCallContract } = t.context.accounts;
    const result = await jsvm.view('view_js_contract', encodeCall(onCallContract.accountId, 'person_on_call', {}));
    t.is(result, 'undefined');
});

test('Person can be set on-call if AVAILABLE', async t => {
    const { ali, bob, jsvm, statusMessageContract, onCallContract } = t.context.accounts;

    // Ali set her status as AVAILABLE
    await ali.call(jsvm, 'call_js_contract', encodeCall(statusMessageContract.accountId, 'set_status', { message: 'AVAILABLE' }), { attachedDeposit: '100000000000000000000000' });
    // Bob sets Ali on-call
    await bob.call(jsvm, 'call_js_contract', encodeCall(onCallContract.accountId, 'set_person_on_call', { accountId: ali.accountId }), { attachedDeposit: '100000000000000000000000' });

    // Check that Ali is on-call
    t.is(
        await jsvm.view('view_js_contract', encodeCall(onCallContract.accountId, 'person_on_call', {})),
        ali.accountId
    );
});

test('Person can NOT be set on-call if UNAVAILABLE', async t => {
    const { ali, bob, jsvm, statusMessageContract, onCallContract } = t.context.accounts;

    // Ali set her status as AVAILABLE
    await ali.call(jsvm, 'call_js_contract', encodeCall(statusMessageContract.accountId, 'set_status', { message: 'UNAVAILABLE' }), { attachedDeposit: '100000000000000000000000' });
    // Bob tries to sets Ali on-call
    await bob.call(jsvm, 'call_js_contract', encodeCall(onCallContract.accountId, 'set_person_on_call', { accountId: ali.accountId }), { attachedDeposit: '100000000000000000000000' });

    // Check that Ali is NOT on-call
    t.not(
        await jsvm.view('view_js_contract', encodeCall(onCallContract.accountId, 'person_on_call', {})),
        ali.accountId
    );
});
