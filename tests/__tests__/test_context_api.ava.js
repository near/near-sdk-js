import { Worker } from 'near-workspaces';
import test from 'ava';


test.before(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the test contract.
    const testContract = await root.createAndDeploy(
        root.getSubAccount('test-contract').accountId,
        'build/test_contract.wasm',
    );

    // Test users
    const ali = await root.createSubAccount('ali');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, testContract, ali };
});

test.after(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test('get current account id correct', async t => {
    const { ali, testContract } = t.context.accounts;
    let r = await ali.call(testContract, 'get_current_account_id', '');
    t.is(r, testContract.accountId);
})

test('get signer account id correct', async t => {
    const { ali, testContract } = t.context.accounts;
    let r = await ali.call(testContract, 'get_signer_account_id', '');
    t.is(r, ali.accountId);
})

test('get predecessor account id correct', async t => {
    const { ali, testContract } = t.context.accounts;
    let r = await ali.call(testContract, 'get_predecessor_account_id', '');
    t.is(r, ali.accountId);
})

test('get signer account pk correct', async t => {
    const { ali, testContract } = t.context.accounts;
    let r = await ali.callRaw(testContract, 'get_signer_account_pk', '');
    // the prefixing byte 0 indicates it's a ED25519 PublicKey, see how PublicKey is serialized in nearcore
    t.deepEqual(Buffer.from(r.result.status.SuccessValue, 'base64'), Buffer.concat([Buffer.from([0]), Buffer.from((await ali.getKey(ali.accountId)).getPublicKey().data)]));
})

test('get input correct', async t => {
    const { ali, testContract } = t.context.accounts;
    let r = await ali.callRaw(testContract, 'get_input', new Uint8Array([0, 1, 255]));
    t.is(r.result.status.SuccessValue, Buffer.from(new Uint8Array([0, 1, 255])).toString('base64'));
})