import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the onCall contract.
    const onCall = await root.createAndDeploy(
        root.getSubAccount('oncall').accountId,
        './build/cross-contract-call.wasm',
    );

    // Init the contract
    await onCall.call(onCall, 'init', {});

    // Deploy status-message the contract.
    const statusMessage = await root.createAndDeploy(
        root.getSubAccount('statusmessage').accountId,
        './build/status-message.wasm',
    );

    // Init the contract
    await statusMessage.call(statusMessage, 'init', {});

    // Create test accounts
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = {
        root,
        statusMessage,
        onCall,
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
    const { onCall } = t.context.accounts;
    const result = await onCall.view('person_on_call', {});
    t.is(result, 'undefined');
});

test('Person can be set on-call if AVAILABLE', async t => {
    const { ali, bob, onCall, statusMessage } = t.context.accounts;

    // Ali set her status as AVAILABLE
    await ali.call(statusMessage, 'set_status', { message: 'AVAILABLE' });
    // Bob sets Ali on-call
    await bob.call(onCall, 'set_person_on_call', { accountId: ali.accountId }, { gas: 120000000000000 });

    // Check that Ali is on-call
    t.is(
        await onCall.view('person_on_call', {}),
        ali.accountId
    );
});

test('Person can NOT be set on-call if UNAVAILABLE', async t => {
    const { ali, bob, onCall, statusMessage } = t.context.accounts;

    // Ali set her status as AVAILABLE
    await ali.call(statusMessage, 'set_status', { message: 'UNAVAILABLE' });
    // Bob tries to sets Ali on-call
    await bob.call(onCall, 'set_person_on_call', { accountId: ali.accountId });

    // Check that Ali is NOT on-call
    t.not(
        await onCall.view('person_on_call', {}),
        ali.accountId
    );
});
