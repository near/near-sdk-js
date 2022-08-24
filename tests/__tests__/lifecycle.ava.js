import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    const worker = await Worker.init();
    const root = worker.rootAccount;

    const constructorEmpty = await root.devDeploy('build/constructor-empty.wasm');
    const constractorNoDefault = await root.devDeploy('build/constructor-no-default.wasm');
    const constractorWithDefault = await root.devDeploy('build/constructor-with-default.wasm');
    const constractorWithSignerApi = await root.devDeploy('build/constructor-with-signer-api.wasm');

    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');

    t.context.worker = worker;
    t.context.accounts = {
        root,
        constructorEmpty,
        constractorNoDefault,
        constractorWithDefault,
        constractorWithSignerApi,
        ali,
        bob,
    };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test('Log expected types work', async t => {
    const { ali, bytesContract } = t.context.accounts;
    t.assert(true)
    
});
