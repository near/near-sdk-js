import { Worker } from 'near-workspaces';
import { readFile } from 'fs/promises'
import test from 'ava';

// function encodeCall(contract, method, args) {
//     return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
// }
//
// // Use test.beforeEach to setup the environment with clean state before each test
// // If tests can be run in parallel in any order, you can reuse the environment by use test.before
// test.beforeEach(async t => {
//     // Init the worker and start a Sandbox server
//     const worker = await Worker.init();
//
//     // Prepare sandbox for tests, create accounts, deploy contracts, etc.
//     const root = worker.rootAccount;
//
//     // Deploy the jsvm contract.
//     const jsvm = await root.createAndDeploy(
//         root.getSubAccount('jsvm').accountId,
//         './node_modules/near-sdk-js/res/jsvm.wasm',
//     );
//
//     // Deploy and init the counter JS contract
//     const counter = await root.createSubAccount('counter');
//     let contract_base64 = (await readFile('build/counter.base64')).toString();
//     await counter.call(jsvm, 'deploy_js_contract', Buffer.from(contract_base64, 'base64'), { attachedDeposit: '400000000000000000000000' });
//     await counter.call(jsvm, 'call_js_contract', encodeCall(counter.accountId, 'init', {}), { attachedDeposit: '400000000000000000000000' });
//
//     // Test users
//     const ali = await root.createSubAccount('ali');
//     const bob = await root.createSubAccount('bob');
//
//     // Save state for test runs
//     t.context.worker = worker;
//     t.context.accounts = { root, jsvm, counter, ali, bob };
// });
//
// // If the environment is reused, use test.after to replace test.afterEach
// test.afterEach(async t => {
//     await t.context.worker.tearDown().catch(error => {
//         console.log('Failed to tear down the worker:', error);
//     });
// });
//
// test('Initial count is 0', async t => {
//     const { jsvm, counter } = t.context.accounts;
//     const result = await jsvm.view('view_js_contract', encodeCall(counter.accountId, 'getCount', {}));
//     t.is(result, 0);
// });
//
// test('Increase works', async t => {
//     const { jsvm, counter, ali, bob } = t.context.accounts;
//     await ali.call(jsvm, 'call_js_contract', encodeCall(counter.accountId, 'increase', {}), { attachedDeposit: '100000000000000000000000' });
//
//     let result = await jsvm.view('view_js_contract', encodeCall(counter.accountId, 'getCount', {}));
//     t.is(result, 1);
//
//     await bob.call(jsvm, 'call_js_contract', encodeCall(counter.accountId, 'increase', { n: 4 }), { attachedDeposit: '100000000000000000000000' });
//     result = await jsvm.view('view_js_contract', encodeCall(counter.accountId, 'getCount', {}));
//     t.is(result, 5);
// });
//
// test('Decrease works', async t => {
//     const { jsvm, counter, ali, bob } = t.context.accounts;
//     await ali.call(jsvm, 'call_js_contract', encodeCall(counter.accountId, 'decrease', {}), { attachedDeposit: '100000000000000000000000' });
//
//     let result = await jsvm.view('view_js_contract', encodeCall(counter.accountId, 'getCount', {}));
//     t.is(result, -1);
//
//     await bob.call(jsvm, 'call_js_contract', encodeCall(counter.accountId, 'decrease', { n: 4 }), { attachedDeposit: '100000000000000000000000' });
//     result = await jsvm.view('view_js_contract', encodeCall(counter.accountId, 'getCount', {}));
//     t.is(result, -5);
// });