import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async (t) => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the ft contract.
    const ft = await root.createAndDeploy(root.getSubAccount('ft').accountId, './build/fungible-token.wasm');
    // Deploy helper contract for cross contract call
    const xcc = await root.createAndDeploy(root.getSubAccount('xcc').accountId, './build/fungible-token-helper.wasm');

    // Init the contracts
    await ft.call(ft, 'init', { prefix: 'a', totalSupply: '1000' });
    await xcc.call(xcc, 'init', {});

    // Create test accounts
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = { root, ft, ali, bob, xcc };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed tear down the worker:', error);
    });
});

test('Owner has all balance in the beginning', async t => {
    const { ft } = t.context.accounts;
    const result = await ft.view('ftBalanceOf', { accountId: ft.accountId });
    t.is(result, '1000');
});

test('Can transfer if balance is sufficient', async t => {
    const { ali, ft } = t.context.accounts;

    await ft.call(ft, 'ftTransfer', { receiverId: ali.accountId, amount: '100' });
    const aliBalance = await ft.view('ftBalanceOf', { accountId: ali.accountId });
    t.is(aliBalance, '100');
    const ownerBalance = await ft.view('ftBalanceOf', { accountId: ft.accountId });
    t.is(ownerBalance, '900');
});

test('Cannot transfer if balance is not sufficient', async t => {
    const { ali, bob, ft } = t.context.accounts;
    try {
        await ali.call(ft, 'ftTransfer', { receiverId: bob.accountId, amount: '100' });
    } catch (e) {
        t.assert(e.toString().indexOf('Smart contract panicked: assertion failed: The account doesn\'t have enough balance') >= 0);
    }
});

test('Cross contract transfer', async (t) => {
    const { xcc, ft } = t.context.accounts;
    await ft.call(ft, 'ftTransferCall', { receiverId: xcc.accountId, amount: '900', memo: null, msg: 'test msg' }, { gas: 200000000000000 });
    const aliBalance = await ft.view('ftBalanceOf', { accountId: xcc.accountId });
    t.is(aliBalance, '900');
    const aliSubContractData = await xcc.view('getContractData');
    t.is(aliSubContractData, `[900 from ${ft.accountId} to ${xcc.accountId}] test msg `);
    const ownerBalance = await ft.view('ftBalanceOf', { accountId: ft.accountId });
    t.is(ownerBalance, '100');
});
