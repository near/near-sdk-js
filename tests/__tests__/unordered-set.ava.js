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
    const unorderedSetContract = await root.devDeploy(
        'build/unordered-set.wasm',
    );
    await unorderedSetContract.call(unorderedSetContract, 'init', {});

    // Test users
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');
    const carl = await root.createSubAccount('carl');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, unorderedSetContract, ali, bob, carl };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('UnorderedSet is empty by default', async t => {
    const { root, unorderedSetContract } = t.context.accounts;
    const result = await unorderedSetContract.view('len', {});
    t.is(result, 0);
    t.is(
        await unorderedSetContract.view('isEmpty', {}),
        true
    );
});

test('UnorderedSet set() contains()', async t => {
    const { ali, unorderedSetContract } = t.context.accounts;
    t.is(
        await unorderedSetContract.view('contains', { element: 'hello' }),
        false
    );

    await ali.call(unorderedSetContract, 'set', { element: 'hello' });

    t.is(
        await unorderedSetContract.view('contains', { element: 'hello' }),
        true
    );
});


test('UnorderedSet insert, len and iterate', async t => {
    const { ali, unorderedSetContract } = t.context.accounts;

    t.is(
        await unorderedSetContract.view('len', {}),
        0
    );
    t.deepEqual(
        await unorderedSetContract.view('toArray', {}),
        []
    );

    await ali.call(unorderedSetContract, 'set', { element: 'hello' });
    t.is(
        await unorderedSetContract.view('len', {}),
        1
    );
    await ali.call(unorderedSetContract, 'set', { element: 'hello1' });
    t.is(
        await unorderedSetContract.view('len', {}),
        2
    );

    // insert the same value, len shouldn't change
    await ali.call(unorderedSetContract, 'set', { element: 'hello1' });
    t.is(
        await unorderedSetContract.view('len', {}),
        2
    );

    t.deepEqual(
        await unorderedSetContract.view('toArray', {}),
        ['hello', 'hello1']
    );
});

test('UnorderedSet extend, remove, clear', async t => {
    const { ali, unorderedSetContract } = t.context.accounts;

    await ali.callRaw(unorderedSetContract, 'extend', { elements: ['hello', 'world', 'hello1'] });

    t.deepEqual(
        await unorderedSetContract.view('toArray', {}),
        ['hello', 'world', 'hello1']
    );

    // remove non existing element should not error
    await ali.call(unorderedSetContract, 'remove_key', { element: 'hello3' });
    t.deepEqual(
        await unorderedSetContract.view('toArray', {}),
        ['hello', 'world', 'hello1']
    );

    // remove not the last one should work
    await ali.call(unorderedSetContract, 'remove_key', { element: 'hello' });
    t.deepEqual(
        await unorderedSetContract.view('toArray', {}),
        ['hello1', 'world']
    );

    // remove the last one should work
    await ali.call(unorderedSetContract, 'remove_key', { element: 'world' });
    t.deepEqual(
        await unorderedSetContract.view('toArray', {}),
        ['hello1']
    );

    // remove when length is 1 should work
    t.is(
        await unorderedSetContract.view('len', {}),
        1
    );
    t.is(
        await unorderedSetContract.view('isEmpty', {}),
        false
    );
    await ali.call(unorderedSetContract, 'remove_key', { element: 'hello1' });
    t.deepEqual(
        await unorderedSetContract.view('toArray', {}),
        []
    );
    t.is(
        await unorderedSetContract.view('isEmpty', {}),
        true
    );

    await ali.call(unorderedSetContract, 'extend', { elements: ['hello', 'world', 'hello1'] });
    t.deepEqual(
        await unorderedSetContract.view('toArray', {}),
        ['hello', 'world', 'hello1']
    );
    t.is(
        await unorderedSetContract.view('isEmpty', {}),
        false
    );
    // clear should work
    await ali.call(unorderedSetContract, 'clear', {});
    t.deepEqual(
        await unorderedSetContract.view('toArray', {}),
        []
    );
    t.is(
        await unorderedSetContract.view('isEmpty', {}),
        true
    );
})

test('Add and check exist of object', async t => {
    const { ali, unorderedSetContract } = t.context.accounts;
    let houseSpec = {name: "a", rooms: [{name: "bedroom", size: "300sqft"}]}
    t.is(
        await unorderedSetContract.view('house_exist', houseSpec),
        false
    );
    await ali.call(unorderedSetContract, 'add_house', houseSpec);
    t.is(
        await unorderedSetContract.view('house_exist', houseSpec),
        true
    );
})