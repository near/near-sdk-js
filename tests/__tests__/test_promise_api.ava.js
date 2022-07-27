import { Worker } from 'near-workspaces';
import test from 'ava';


test.before(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the test contract.
    const callerContract = await root.devDeploy(
        'build/promise_api.wasm',
    );

    const calleeContract = await root.devDeploy(
        'build/promise_api.wasm',
    );

    const caller2Contract = await root.devDeploy(
        'build/promise_batch_api.wasm',
        {initialBalance: '100100N'}
    );

    // Test users
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, callerContract, calleeContract, ali, bob, caller2Contract };
});

test.after(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('promise create', async t => {
    const { ali, callerContract, calleeContract } = t.context.accounts;
    // default is 30 TGas, sufficient when the callee contract method is trivial
    let r = await ali.callRaw(callerContract, 'test_promise_create', '', {gas: '40 Tgas'});
    t.is(r.result.receipts_outcome[1].outcome.executor_id, calleeContract.accountId);
    t.deepEqual(Buffer.from(r.result.receipts_outcome[1].outcome.status.SuccessValue, 'base64'), Buffer.from(JSON.stringify({
        currentAccountId: calleeContract.accountId,
        signerAccountId: ali.accountId,
        predecessorAccountId: callerContract.accountId,
        input: 'abc',
    })));
});

test('promise then', async t => {
    const { ali, callerContract, calleeContract } = t.context.accounts;
    let r = await ali.callRaw(callerContract, 'test_promise_then', '', {gas: '70 Tgas'});
    // console.log(JSON.stringify(r, null, 2))
    // call the callee
    t.is(r.result.receipts_outcome[1].outcome.executor_id, calleeContract.accountId);
    t.deepEqual(JSON.parse(Buffer.from(r.result.receipts_outcome[1].outcome.status.SuccessValue, 'base64')), {
        currentAccountId: calleeContract.accountId,
        signerAccountId: ali.accountId,
        predecessorAccountId: callerContract.accountId,
        input: 'abc',
    });

    // the callback scheduled by promise_then
    t.is(r.result.receipts_outcome[3].outcome.executor_id, callerContract.accountId);
    t.deepEqual(JSON.parse(Buffer.from(r.result.receipts_outcome[3].outcome.status.SuccessValue, 'base64')), {
        currentAccountId: callerContract.accountId,
        signerAccountId: ali.accountId,
        predecessorAccountId: callerContract.accountId,
        input: 'def',
        promiseResults: [JSON.stringify({
            currentAccountId: calleeContract.accountId,
            signerAccountId: ali.accountId,
            predecessorAccountId: callerContract.accountId,
            input: 'abc',
        })]
    });
});

test('promise and', async t => {
    const { ali, callerContract, calleeContract } = t.context.accounts;
    let r = await ali.callRaw(callerContract, 'test_promise_and', '', {gas: '150 Tgas'});
    // console.log(JSON.stringify(r, null, 2))
    // promise and schedule to call the callee
    t.is(r.result.receipts_outcome[1].outcome.executor_id, calleeContract.accountId);
    t.deepEqual(JSON.parse(Buffer.from(r.result.receipts_outcome[1].outcome.status.SuccessValue, 'base64')), {
        currentAccountId: calleeContract.accountId,
        signerAccountId: ali.accountId,
        predecessorAccountId: callerContract.accountId,
        input: 'abc',
    });

    // promise and schedule to call the callee, with different args
    t.is(r.result.receipts_outcome[3].outcome.executor_id, calleeContract.accountId);
    t.deepEqual(JSON.parse(Buffer.from(r.result.receipts_outcome[3].outcome.status.SuccessValue, 'base64')), {
        currentAccountId: calleeContract.accountId,
        signerAccountId: ali.accountId,
        predecessorAccountId: callerContract.accountId,
        input: 'def',
    });

    // the callback scheduled by promise_then on the promise created by promise_and
    t.is(r.result.receipts_outcome[5].outcome.executor_id, callerContract.accountId);
    t.deepEqual(JSON.parse(Buffer.from(r.result.receipts_outcome[5].outcome.status.SuccessValue, 'base64')), {
        currentAccountId: callerContract.accountId,
        signerAccountId: ali.accountId,
        predecessorAccountId: callerContract.accountId,
        input: 'ghi',
        promiseResults: [JSON.stringify({
            currentAccountId: calleeContract.accountId,
            signerAccountId: ali.accountId,
            predecessorAccountId: callerContract.accountId,
            input: 'abc',
        }), JSON.stringify({
            currentAccountId: calleeContract.accountId,
            signerAccountId: ali.accountId,
            predecessorAccountId: callerContract.accountId,
            input: 'def',
        })]
    });
});

test('promise batch create account, transfer', async t => {
    const { bob, caller2Contract } = t.context.accounts;

    let r = await bob.callRaw(caller2Contract, 'test_promise_batch_create_transfer', '', {gas: '100 Tgas'});
    t.is(r.result.receipts_outcome[1].outcome.executor_id, caller2Contract.getSubAccount('a').accountId);
    t.is(r.result.receipts_outcome[1].outcome.status.SuccessValue, '');

    let balance = await caller2Contract.getSubAccount('a').balance()
    t.is(balance.total.toString(), '10000000000000000000000000')
});

test('promise batch deploy contract and call', async t => {
    const { bob, caller2Contract } = t.context.accounts;

    let r = await bob.callRaw(caller2Contract, 'test_promise_batch_deploy_call', '', {gas: '200 Tgas'});
    let deployed = caller2Contract.getSubAccount('b');
    t.deepEqual(JSON.parse(Buffer.from(r.result.status.SuccessValue, 'base64')), {
        currentAccountId: deployed.accountId,
        signerAccountId: bob.accountId,
        predecessorAccountId: caller2Contract.accountId,
        input: 'abc',
    });
});

test('promise batch stake', async t => {
    const { caller2Contract } = t.context.accounts;
    await caller2Contract.callRaw(caller2Contract, 'test_promise_batch_stake', '', {gas: '100 Tgas'});
    let balance = await caller2Contract.balance();
    t.is(balance.staked.toString(), '100000000000000000000000000000');
});

test('promise batch add full access key', async t => {
    const { bob, caller2Contract } = t.context.accounts;
    let r = await bob.callRaw(caller2Contract, 'test_promise_add_full_access_key', '', {gas: '100 Tgas'});
    t.is(r.result.status.SuccessValue, '');
});

test('promise batch add function call key', async t => {
    const { bob, caller2Contract } = t.context.accounts;
    let r = await bob.callRaw(caller2Contract, 'test_promise_add_function_call_access_key', '', {gas: '100 Tgas'});
    t.is(r.result.status.SuccessValue, '');
});

test('promise delete account', async t => {
    const { bob, caller2Contract } = t.context.accounts;
    let r = await bob.callRaw(caller2Contract, 'test_delete_account', '', {gas: '100 Tgas'});
    t.is(r.result.status.SuccessValue, '');
    t.is(await caller2Contract.getSubAccount('e').exists(), false);
});