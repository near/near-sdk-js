import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    const worker = await Worker.init();
    const root = worker.rootAccount;

    const constructorEmpty = await root.devDeploy('build/constructor-empty.wasm');
    const constructorNoDefault = await root.devDeploy('build/constructor-no-default.wasm');
    const constructorDefault = await root.devDeploy('build/constructor-default.wasm');
    const constructorSignerApiDefault = await root.devDeploy('build/constructor-signer-api-default.wasm');
    const constructorSignerApiNoDefault = await root.devDeploy('build/constructor-signer-api-no-default.wasm');

    const ali = await root.createSubAccount('ali');

    t.context.worker = worker;
    t.context.accounts = {
        root,
        constructorEmpty,
        constructorNoDefault,
        constructorDefault,
        constructorSignerApiDefault,
        constructorSignerApiNoDefault,
        ali,
    };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});


test('All types of contracts work after initialization', async t => {
    const {
        ali,
        constructorEmpty,
        constructorNoDefault,
        constructorDefault,
        constructorSignerApiDefault,
        constructorSignerApiNoDefault,
    } = t.context.accounts;

    const TEST_STATUS_1 = 'abc';
    const TEST_STATUS_2 = 'defg'

    // Contract with empty constructor
    await ali.call(constructorEmpty, 'init', {});
    let status1 = await constructorEmpty.view('getStatus', {})
    t.assert(status1, null)
    await ali.call(constructorEmpty, 'setStatus', { status: TEST_STATUS_1 })
    status1 = await constructorEmpty.view('getStatus', {})
    t.assert(status1, TEST_STATUS_1)

    // Contract with no defaults
    await constructorNoDefault.call(ft, 'init', { status: TEST_STATUS_1 });
    let status2 = await constructorNoDefault.view('getStatus', {})
    t.assert(status2, TEST_STATUS_1)
    await ali.call(constructorNoDefault, 'setStatus', { status: TEST_STATUS_2 })
    status2 = await constructorNoDefault.view('getStatus', {})
    t.assert(status2, TEST_STATUS_2)

    // Contract with with defaults
    await constructorDefault.call(ft, 'init', {});
    let status3 = await constructorDefault.view('getStatus', {})
    t.assert(status3, 'default status')
    await ali.call(constructorDefault, 'setStatus', { status: TEST_STATUS_1 })
    status3 = await constructorDefault.view('getStatus', {})
    t.assert(status3, TEST_STATUS_1)

    // Contract with with signer API in constructor and defaults
    await constructorSignerApiDefault.call(ft, 'init', {});
    let status4 = await constructorSignerApiDefault.view('getStatus', {})
    t.assert(status4, 'default status')
    await ali.call(constructorSignerApiDefault, 'setStatus', { status: TEST_STATUS_1 })
    status4 = await constructorSignerApiDefault.view('getStatus', {})
    t.assert(status4, TEST_STATUS_1)

    // Contract with with signer API in constructor and no defaults
    await constructorSignerApiNoDefault.call(ft, 'init', {});
    let status5 = await constructorSignerApiNoDefault.view('getStatus', {})
    t.assert(status5, 'default status')
    await ali.call(constructorSignerApiNoDefault, 'setStatus', { status: TEST_STATUS_1 })
    status5 = await constructorSignerApiNoDefault.view('getStatus', {})
    t.assert(status5, TEST_STATUS_1)
});

test('Only some types of contracts works without initialization', async t => {
    const {
        ali,
        constructorEmpty,
        constructorNoDefault,
        constructorDefault,
        constructorSignerApiDefault,
        constructorSignerApiNoDefault,
    } = t.context.accounts;

    // Contract with empty constructor
    let status1 = await constructorEmpty.view('getStatus', {})
    t.assert(status1, null)
    await ali.call(constructorEmpty, 'setStatus', { status: TEST_STATUS_1 })
    status1 = await constructorEmpty.view('getStatus', {})
    t.assert(status1, TEST_STATUS_1)

    // Contract with no defaults
    await constructorNoDefault.view('getStatus', {}) // TODO: should panic, init required
    await ali.call(constructorNoDefault, 'setStatus', { status: TEST_STATUS_2 }) // TODO: should panic. init required

    // Contract with with defaults
    let status3 = await constructorDefault.view('getStatus', {})
    t.assert(status3, 'default status')
    await ali.call(constructorDefault, 'setStatus', { status: TEST_STATUS_1 })
    status3 = await constructorDefault.view('getStatus', {})
    t.assert(status3, TEST_STATUS_1)

    // Contract with with signer API in constructor and defaults
    await constructorSignerApiDefault.view('getStatus', {}) // TODO: should panic, can not use signer API in view
    await ali.call(constructorSignerApiDefault, 'setStatus', { status: TEST_STATUS_1 })
    let status4 = await constructorSignerApiDefault.view('getStatus', {})
    t.assert(status4, TEST_STATUS_1)

    // Contract with with signer API in constructor and no defaults
    let status5 = await constructorSignerApiNoDefault.view('getStatus', {}) // TODO: should panic, init required
    t.assert(status5, 'default status')
    await ali.call(constructorSignerApiNoDefault, 'setStatus', { status: TEST_STATUS_1 }) // TODO: should panic, init required
    status5 = await constructorSignerApiNoDefault.view('getStatus', {})
    t.assert(status5, TEST_STATUS_1)
})

test('Contract throws an error if initialized for the second time', async t => {
    const {
        ali,
        constructorEmpty,
        constructorNoDefault,
        constructorDefault,
        constructorSignerApiDefault,
        constructorSignerApiNoDefault,
    } = t.context.accounts;

    await ali.call(constructorEmpty, 'init', {});
    await ali.call(constructorEmpty, 'init', {}); // TODO: should panic, contract already initialized

    await ali.call(constructorNoDefault, 'init', { status: 'value' });
    await ali.call(constructorNoDefault, 'init', { status: 'value' }); // TODO: should panic, contract already initialized

    await ali.call(constructorDefault, 'init', {});
    await ali.call(constructorDefault, 'init', {}); // TODO: should panic, contract already initialized

    await ali.call(constructorSignerApiDefault, 'init', {});
    await ali.call(constructorSignerApiDefault, 'init', {}); // TODO: should panic, contract already initialized

    await ali.call(constructorSignerApiNoDefault, 'init', { status: 'value' });
    await ali.call(constructorSignerApiNoDefault, 'init', { status: 'value' }); // TODO: should panic, contract already initialized
});
