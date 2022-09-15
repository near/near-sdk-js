import { Worker } from 'near-workspaces';
import test from 'ava';

const DEPOSIT = 1_000_000_000;

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


test.afterEach.always(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('payable: true functions works with deposit', async t => {
    const { ali, payableContract } = t.context.accounts;

    await t.notThrowsAsync(ali.call(payableContract, 'setValueWithPayableFunction', { value: 'hello' }, { attachedDeposit: DEPOSIT }));

})

test('payable: true functions works without deposit', async t => {
    const { ali, payableContract } = t.context.accounts;

    await t.notThrowsAsync(ali.call(payableContract, 'setValueWithPayableFunction', { value: 'hello' }));

})

test('payable: false throws if atach deposit', async t => {
    const { ali, payableContract } = t.context.accounts;

    const result = await ali.callRaw(payableContract, 'setValueWithNotPayableFunction', { value: 'hello' }, { attachedDeposit: DEPOSIT });

    t.assert(result.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes('Function is not payable'));
})

test('payable default throws if atach deposit', async t => {
    const { ali, payableContract } = t.context.accounts;

    const result = await ali.callRaw(payableContract, 'setValueWithNotPayableFunctionByDefault', { value: 'hello' }, { attachedDeposit: DEPOSIT });
    t.assert(result.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes('Function is not payable'));
})

test('payable default works without deposit', async t => {
    const { ali, payableContract } = t.context.accounts;

    await t.notThrowsAsync(ali.call(payableContract, 'setValueWithNotPayableFunctionByDefault', { value: 'hello' }));
})
