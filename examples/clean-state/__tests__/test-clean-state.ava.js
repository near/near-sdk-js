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

    // Deploy clean state contract
    const cleanStateContract = await root.createSubAccount('fungible-token');
    let cleanStateContractBase64 = (await readFile('build/contract.base64')).toString();
    await cleanStateContract.call(jsvm, 'deploy_js_contract', Buffer.from(cleanStateContractBase64, 'base64'), { attachedDeposit: '400000000000000000000000' });
    await cleanStateContract.call(jsvm, 'call_js_contract', encodeCall(cleanStateContract.accountId, 'init', [[]]), { attachedDeposit: '400000000000000000000000' });

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = {
        root,
        jsvm,
        cleanStateContract,
    };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed tear down the worker:', error);
    });
});

test('Clean state after storing', async t => {
    const { jsvm, cleanStateContract } = t.context.accounts;
    await cleanStateContract.call(jsvm, 'call_js_contract', encodeCall(cleanStateContract.accountId, 'put', ['1', 1]), { attachedDeposit: '400000000000000000000000' });
    const value1 = await jsvm.view('view_js_contract', encodeCall(cleanStateContract.accountId, 'get', ['1']));
    t.is(value1, '1');
    await cleanStateContract.call(jsvm, 'call_js_contract', encodeCall(cleanStateContract.accountId, 'init', [['1']]), { attachedDeposit: '400000000000000000000000' });
    const value2 = await jsvm.view('view_js_contract', encodeCall(cleanStateContract.accountId, 'get', ['1']));
    t.is(value2, null);
});
