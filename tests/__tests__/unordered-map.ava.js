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
    const unorderedMapContract = await root.createAndDeploy(
        root.getSubAccount('test-contract').accountId,
        'build/unordered-map.wasm',
    );
    await unorderedMapContract.call(unorderedMapContract, 'init', {});
    // Test users
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');
    const carl = await root.createSubAccount('carl');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, unorderedMapContract, ali, bob, carl };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('UnorderedMap is empty by default', async t => {
    const { root, unorderedMapContract } = t.context.accounts;
    const result = await unorderedMapContract.view('len', {});
    t.is(result, 0);
});

test('UnorderedMap set() get()', async t => {
    const { ali, unorderedMapContract } = t.context.accounts;
    t.is(
        await unorderedMapContract.view('get', { key: 'hello' }),
        null
    );

    await ali.call(unorderedMapContract, 'set', { key: 'hello', value: 'world' });

    t.is(
        await unorderedMapContract.view('get', { key: 'hello' }),
        'world'
    );
});


test('UnorderedMap insert, update, len and iterate', async t => {
    const { ali, unorderedMapContract } = t.context.accounts;

    t.is(
        await unorderedMapContract.view('len', {}),
        0
    );
    t.deepEqual(
        await unorderedMapContract.view('toArray', {}),
        []
    );

    await ali.call(unorderedMapContract, 'set', { key: 'hello', value: 'world' });
    await ali.call(unorderedMapContract, 'set', { key: 'hello1', value: 'world0' });
    t.is(
        await unorderedMapContract.view('len', {}),
        2
    );

    // update a value, len shouldn't change
    await ali.call(unorderedMapContract, 'set', { key: 'hello1', value: 'world1' });
    t.is(
        await unorderedMapContract.view('len', {}),
        2
    );
    // update should have effect
    t.is(
        await unorderedMapContract.view('get', { key: 'hello1' }),
        'world1'
    );

    await ali.call(unorderedMapContract, 'set', { key: 'hello2', value: 'world2' });
    t.is(
        await unorderedMapContract.view('len', {}),
        3
    );

    // Try to set a key with same value, len shouldn't change
    await ali.call(unorderedMapContract, 'set', { key: 'hello2', value: 'world2' });
    t.is(
        await unorderedMapContract.view('len', {}),
        3
    );

    t.deepEqual(
        await unorderedMapContract.view('toArray', {}),
        [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']]
    );
});

test('UnorderedMap extend, remove, clear', async t => {
    const { ali, unorderedMapContract } = t.context.accounts;

    await ali.call(unorderedMapContract, 'extend', { kvs: [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']] });

    t.deepEqual(
        await unorderedMapContract.view('toArray', {}),
        [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']]
    );

    // remove non existing element should not error
    await ali.call(unorderedMapContract, 'remove_key', { key: 'hello3' });
    t.deepEqual(
        await unorderedMapContract.view('toArray', {}),
        [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']]
    );

    // remove not the last one should work
    await ali.call(unorderedMapContract, 'remove_key', { key: 'hello' });
    t.deepEqual(
        await unorderedMapContract.view('toArray', {}),
        [['hello2', 'world2'], ['hello1', 'world1']]
    );

    // remove the last one should work
    await ali.call(unorderedMapContract, 'remove_key', { key: 'hello1' });
    t.deepEqual(
        await unorderedMapContract.view('toArray', {}),
        [['hello2', 'world2']]
    );

    // remove when length is 1 should work
    t.is(
        await unorderedMapContract.view('len', {}),
        1
    );
    t.is(
        await unorderedMapContract.view('isEmpty', {}),
        false
    );
    await ali.call(unorderedMapContract, 'remove_key', { key: 'hello2' });
    t.deepEqual(
        await unorderedMapContract.view('toArray', {}),
        []
    );
    t.is(
        await unorderedMapContract.view('isEmpty', {}),
        true
    );

    await ali.call(unorderedMapContract, 'extend', { kvs: [['hello', 'world'], ['hello1', 'world1'], ['hello2', 'world2']] });
    t.is(
        await unorderedMapContract.view('isEmpty', {}),
        false
    );
    await ali.call(unorderedMapContract, 'clear', {});

    t.deepEqual(
        await unorderedMapContract.view('toArray', {}),
        []
    );
    t.is(
        await unorderedMapContract.view('isEmpty', {}),
        true
    );
})