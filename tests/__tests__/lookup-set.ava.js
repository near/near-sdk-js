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

    // Deploy the test contract.
    const lookupSetContract = await root.devDeploy(
        'build/lookup-set.wasm',
    );
    await lookupSetContract.call(lookupSetContract, 'init', {});
    // Test users
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');
    const carl = await root.createSubAccount('carl');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, lookupSetContract, ali, bob, carl };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('LookupSet set() contains()', async t => {
    const { ali, lookupSetContract } = t.context.accounts;
    t.is(
        await lookupSetContract.view('contains', { key: 'hello' }),
        false
    );

    await ali.call(lookupSetContract, 'set', { key: 'hello' });

    t.is(
        await lookupSetContract.view('contains', { key: 'hello' }),
        true
    );
});


test('LookupSet remove', async t => {
    const { ali, lookupSetContract } = t.context.accounts;

    await ali.call(lookupSetContract, 'set', { key: 'hello' });
    await ali.call(lookupSetContract, 'set', { key: 'hello1' });

    // remove non existing element should not error
    await ali.call(lookupSetContract, 'remove_key', { key: 'hello3' });
    // remove existing key should work
    await ali.call(lookupSetContract, 'remove_key', { key: 'hello1' });
    t.is(
        await lookupSetContract.view('contains', { key: 'hello1' }),
        false
    );
    // not removed key should not affected
    t.is(
        await lookupSetContract.view('contains', { key: 'hello' }),
        true
    );
});

test('LookupSet extend', async t => {
    const { ali, lookupSetContract } = t.context.accounts;

    await ali.call(lookupSetContract, 'extend', { keys: ['hello', 'world', 'hello1'] });
    t.is(
        await lookupSetContract.view('contains', { key: 'hello' }),
        true
    );
    t.is(
        await lookupSetContract.view('contains', { key: 'hello1' }),
        true
    );
    t.is(
        await lookupSetContract.view('contains', { key: 'world' }),
        true
    );
})