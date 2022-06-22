import { Worker } from 'near-workspaces';
import { readFile } from 'fs/promises'
import test from 'ava';

function encodeCall(contract, method, args) {
  return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
}

function toYocto(n) {
  return String(BigInt(n * 1000) * BigInt(`1000000000000000000000`));
}

test.beforeEach(async t => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etc.
  const root = worker.rootAccount;

  // Deploy the jsvm contract.
  const jsvm = await root.createAndDeploy(
    root.getSubAccount('jsvm').accountId,
    './node_modules/near-sdk-js/res/jsvm.wasm',
  );

  // Deploy and init the counter JS contract
  const donationContract = await root.createSubAccount('donation');
  const benecifiaryAccount = await root.createSubAccount('benecifiary');
  let contract_base64 = (await readFile('build/donation.base64')).toString();
  await donationContract.call(jsvm, 'deploy_js_contract', Buffer.from(contract_base64, 'base64'), { attachedDeposit: toYocto(4) });
  await donationContract.call(jsvm, 'call_js_contract', encodeCall(donationContract.accountId, 'init', { beneficiary: benecifiaryAccount.accountId }), { attachedDeposit: toYocto(4) });

  // Test users
  const donor1 = await root.createSubAccount('donor1');
  const donor2 = await root.createSubAccount('donor2');

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = {
    root,
    jsvm,
    donationContract,
    benecifiaryAccount,
    donor1,
    donor2,
  };
});

// If the environment is reused, use test.after to replace test.afterEach
test.afterEach(async t => {
  await t.context.worker.tearDown().catch(error => {
    console.log('Failed to tear down the worker:', error);
  });
});

test('No donations for beneficiary after init', async t => {
  const { jsvm, donationContract } = t.context.accounts;
  // beneficiary is 'benecifiaryAccount'
  let result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'get_beneficiary', {}));
  t.is(result, 'benecifiary.test.near');

  // donations list => []
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'get_donation_list', {}));
  t.deepEqual(result, []);

  // total donations => 0
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'total_donations', {}));
  t.is(result, 0);
});

test('Each donation is registered in contract state', async t => {
  const { jsvm, donationContract, donor1, donor2 } = t.context.accounts;
  let result;
  // donor1 donates 0.1N
  await donor1.call(jsvm, 'call_js_contract', encodeCall(donationContract.accountId, 'donate', {}), { attachedDeposit: toYocto(0.1) });

  // total_donations => 1
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'total_donations', {}));
  t.is(result, 1);

  // get_donation_list => [{donor1, 1yN}]
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'get_donation_list', {}));
  t.snapshot(result)

  // get_donation_by_number(0) => 0.1yN
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'get_donation_by_number', {donation_number: 0}));
  t.snapshot(result)

  // donor2 donates 0.2N
  await donor2.call(jsvm, 'call_js_contract', encodeCall(donationContract.accountId, 'donate', {}), { attachedDeposit: toYocto(0.2) });

  // total_donations => 2
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'total_donations', {}));
  t.is(result, 2);

  // donations list => donor1,donor2
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'get_donation_list', {}));
  t.snapshot(result)
  // donation2 => of donor2
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'get_donation_by_number', {donation_number: 1}));
  t.snapshot(result)

  // donor1 donates 0.3N
  await donor1.call(jsvm, 'call_js_contract', encodeCall(donationContract.accountId, 'donate', {}), { attachedDeposit: toYocto(0.3) });
  // donor1 donates 1.1N
  await donor1.call(jsvm, 'call_js_contract', encodeCall(donationContract.accountId, 'donate', {}), { attachedDeposit: toYocto(1.1) });

  // total donations => 4
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'total_donations', {}));
  t.is(result, 4);

  // donations list => [donor1,donor2,donor1,donor1]
  result = await jsvm.view('view_js_contract', encodeCall(donationContract.accountId, 'get_donation_list', {}));
  t.snapshot(result)
});
