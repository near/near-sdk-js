import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    const worker = await Worker.init();
    const root = worker.rootAccount;

    const contract = await root.devDeploy('build/private.wasm');
    const ali = await root.createSubAccount('ali');

    t.context.worker = worker;
    t.context.accounts = {
        root,
        contract,
        ali,
    };
});


test.afterEach.always(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('private: true throws if called from another acc', async t => {
    const { ali, contract } = t.context.accounts;

    const result = await ali.callRaw(contract, 'setValueWithPrivateFunction', { value: 'hello' });

    t.assert(result.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.includes('Function is private'));

})

test('private: true not throws if called from owner acc', async t => {
    const { contract } = t.context.accounts;

    await t.notThrowsAsync(contract.call(contract, 'setValueWithNotPrivateFunction', { value: 'hello' }));

})

test('private: default not throws from another acc', async t => {
    const { ali, contract } = t.context.accounts;

    await t.notThrowsAsync(ali.call(contract, 'setValueWithNotPrivateFunctionByDefault', { value: 'hello' }));
})
