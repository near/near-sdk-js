import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    const worker = await Worker.init();
    const root = worker.rootAccount;

    const payableContract = await root.devDeploy('build/payable.wasm');
    const ali = await root.createSubAccount('ali');

    t.context.worker = worker;
    t.context.accounts = {
        root,
        payableContract,
        ali,
    };
});


test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('payable: true functions work', async t => {
    const { ali, payableContract } = t.context.accounts;

    const aliBalanceBefore = await ali.getBalance();
    const contractBalanceBefore = await payableContract.getBalance();

    await ali.call(payableContract, 'setValueWithPayableFunction', { value: 'hello' }); // TODO: add deposit

    const aliBalanceAfter = await ali.getBalance();
    const contractBalanceAfter = await payableContract.getBalance();

    const statusAfter = await ali.call(payableContract, 'getValue', {});

    t.assert(err.message.includes('Contract must be initialized')); // TODO: do all the checks
})

test('payable: false throws if atach deposit', async t => {
    const { ali, payableContract } = t.context.accounts;

    const result = await ali.callRaw(payableContract, 'setValueWithNotPayableFunction', { value: 'hello' }, { deposit: '1' }); // TODO: add deposit
    t.assert(result.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes('Contract must be initialized')); // TODO: check error message
})

test('payable default throws if atach deposit', async t => {
    const { ali, payableContract } = t.context.accounts;

    const result = await ali.callRaw(payableContract, 'setValueWithNotPayableFunction', { value: 'hello' }, { deposit: '1' }); // TODO: add deposit
    t.assert(result.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes('Contract must be initialized')); // TODO: check error message
})

// TODO: should we have "payable: 8" design?

