import { Worker } from 'near-workspaces';
import { readFile } from 'fs/promises'
import test from 'ava';

// TODO: make this function part of the npm package when it is available
function encodeCall(contract, method, args) {
    return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
}

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the jsvm contract.
    const jsvm = await root.createAndDeploy(
        root.getSubAccount('jsvm').accountId,
        './node_modules/near-sdk-js/res/jsvm.wasm',
    );

    // Deploy fungible token contract
    const fungibleTokenContract = await root.createSubAccount('fungible-token');
    let ftContractBase64 = (await readFile('build/contract.base64')).toString();
    await fungibleTokenContract.call(jsvm, 'deploy_js_contract', Buffer.from(ftContractBase64, 'base64'), { attachedDeposit: '400000000000000000000000' });
    await fungibleTokenContract.call(jsvm, 'call_js_contract', encodeCall(fungibleTokenContract.accountId, 'init', { prefix: 'a', totalSupply: '1000' }), { attachedDeposit: '400000000000000000000000' });

    // Create test accounts
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = {
        root,
        jsvm,
        fungibleTokenContract,
        ali,
        bob,
    };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed tear down the worker:', error);
    });
});

test('Owner has all balance in the beginning', async t => {
    const { jsvm, fungibleTokenContract } = t.context.accounts;
    const result = await jsvm.view('view_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftBalanceOf', { accountId: fungibleTokenContract.accountId }));
    t.is(result, '1000');
});

test('Can transfer if balance is sufficient', async t => {
    const { ali, jsvm, fungibleTokenContract } = t.context.accounts;

    await fungibleTokenContract.call(jsvm, 'call_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftTransfer', { receiverId: ali.accountId, amount: '100' }), { attachedDeposit: '400000000000000000000000' });
    const aliBalance = await jsvm.view('view_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftBalanceOf', { accountId: ali.accountId }));
    t.is(aliBalance, '100');
    const ownerBalance = await jsvm.view('view_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftBalanceOf', { accountId: fungibleTokenContract.accountId }));
    t.is(ownerBalance, '900');
});

test('Cannot transfer if balance is not sufficient', async t => {
    const { ali, bob, jsvm, fungibleTokenContract } = t.context.accounts;
    try {
        await ali.call(jsvm, 'call_js_contract', encodeCall(fungibleTokenContract.accountId, 'ftTransfer', { receiverId: bob.accountId, amount: '100' }), { attachedDeposit: '400000000000000000000000' });
    } catch (e) {
        t.assert(e.toString().indexOf('Smart contract panicked: assertion failed: The account doesn\'t have enough balance') >= 0);
    }
});
