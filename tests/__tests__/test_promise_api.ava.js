import { Worker } from 'near-workspaces';
import test from 'ava';


test.before(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the test contract.
    const callerContract = await root.createAndDeploy(
        root.getSubAccount('caller-contract').accountId,
        'build/promise_api.wasm',
    );

    const calleeContract = await root.createAndDeploy(
        root.getSubAccount('callee-contract').accountId,
        'build/promise_api.wasm',
    );

    // Test users
    const ali = await root.createSubAccount('ali');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, callerContract, calleeContract, ali };
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
