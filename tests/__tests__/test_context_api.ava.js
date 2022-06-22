import { Worker } from 'near-workspaces';
import test from 'ava';


test.before(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the test contract.
    const contextApiContract = await root.createAndDeploy(
        root.getSubAccount('test-contract').accountId,
        'build/context_api.wasm',
    );

    // Test users
    const ali = await root.createSubAccount('ali');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, contextApiContract, ali };
});

test.after(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test('get current account id correct', async t => {
    const { ali, contextApiContract } = t.context.accounts;
    let r = await ali.call(contextApiContract, 'get_current_account_id', '');
    t.is(r, contextApiContract.accountId);
})

test('get signer account id correct', async t => {
    const { ali, contextApiContract } = t.context.accounts;
    let r = await ali.call(contextApiContract, 'get_signer_account_id', '');
    t.is(r, ali.accountId);
})

test('get predecessor account id correct', async t => {
    const { ali, contextApiContract } = t.context.accounts;
    let r = await ali.call(contextApiContract, 'get_predecessor_account_id', '');
    t.is(r, ali.accountId);
})

test('get signer account pk correct', async t => {
    const { ali, contextApiContract } = t.context.accounts;
    let r = await ali.callRaw(contextApiContract, 'get_signer_account_pk', '');
    // the prefixing byte 0 indicates it's a ED25519 PublicKey, see how PublicKey is serialized in nearcore
    t.deepEqual(Buffer.from(r.result.status.SuccessValue, 'base64'), Buffer.concat([Buffer.from([0]), Buffer.from((await ali.getKey(ali.accountId)).getPublicKey().data)]));
})

test('get input correct', async t => {
    const { ali, contextApiContract } = t.context.accounts;
    let r = await ali.callRaw(contextApiContract, 'get_input', new Uint8Array([0, 1, 255]));
    t.is(r.result.status.SuccessValue, Buffer.from(new Uint8Array([0, 1, 255])).toString('base64'));
})