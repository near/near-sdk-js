import { Worker } from 'near-workspaces';
import { readFile } from 'fs/promises'
import test from 'ava';

function encodeCall(contract, method, args) {
    return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
}

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the jsvm contract.
    const jsvm = await root.devDeploy(
        './node_modules/near-sdk-js/jsvm/build/jsvm.wasm',
    );

    // Deploy lockable FT JS contract
    const lockableFt = await root.createSubAccount('lockable-ft');
    let contract_base64 = (await readFile('build/fungible-token-lockable.base64')).toString();
    await lockableFt.call(jsvm, 'deploy_js_contract', Buffer.from(contract_base64, 'base64'), { attachedDeposit: '1000000000000000000000000' });
    await lockableFt.call(jsvm, 'call_js_contract', encodeCall(lockableFt.accountId, 'init', { prefix: 'prefix', totalSupply: 10000 }), { attachedDeposit: '1000000000000000000000000' });

    // Test users
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, jsvm, lockableFt, ali, bob };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('Owner initial details', async t => {
    const { jsvm, lockableFt } = t.context.accounts;
    const totalSupply = await jsvm.view('view_js_contract', encodeCall(lockableFt.accountId, 'getTotalSupply', {}));
    t.is(totalSupply, 10000);
    const totalBalance = await jsvm.view('view_js_contract', encodeCall(lockableFt.accountId, 'getTotalBalance', { ownerId: lockableFt.accountId }));
    t.is(totalBalance, 10000);
    const unlockedBalance = await jsvm.view('view_js_contract', encodeCall(lockableFt.accountId, 'getUnlockedBalance', { ownerId: lockableFt.accountId }));
    t.is(unlockedBalance, 10000);
    const allowance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getAllowance', { ownerId: lockableFt.accountId, escrowAccountId: lockableFt.accountId })
    );
    t.is(allowance, 0);
    const lockedBalance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getLockedBalance', { ownerId: lockableFt.accountId, escrowAccountId: lockableFt.accountId })
    );
    t.is(lockedBalance, 0);
});

test('Set allowance', async t => {
    const { jsvm, lockableFt, ali } = t.context.accounts;
    await lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'setAllowance', { escrowAccountId: ali.accountId, allowance: 100 }),
        { attachedDeposit: '100000000000000000000000' }
    );
    const aliAllowance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getAllowance', { ownerId: lockableFt.accountId, escrowAccountId: ali.accountId })
    );
    t.is(aliAllowance, 100);
    const contractAllowance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getAllowance', { ownerId: lockableFt.accountId, escrowAccountId: lockableFt.accountId })
    );
    t.is(contractAllowance, 0);
});

test('Fail to set allowance for oneself', async t => {
    const { jsvm, lockableFt } = t.context.accounts;
    const error = await t.throwsAsync(() => lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'setAllowance', { escrowAccountId: lockableFt.accountId, allowance: 100 }),
        { attachedDeposit: '100000000000000000000000' }
    ));
    t.assert(error.message.includes(`Can't set allowance for yourself`));
});

test('Lock owner', async t => {
    const { jsvm, lockableFt, ali } = t.context.accounts;
    await lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'lock', { ownerId: lockableFt.accountId, lockAmount: 100 }),
        { attachedDeposit: '100000000000000000000000' }
    );
    const unlockedBalance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getUnlockedBalance', { ownerId: lockableFt.accountId })
    );
    t.is(unlockedBalance, 9900);
    const allowance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getAllowance', { ownerId: lockableFt.accountId, escrowAccountId: lockableFt.accountId })
    );
    t.is(allowance, 0);
    const lockedBalance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getLockedBalance', { ownerId: lockableFt.accountId, escrowAccountId: lockableFt.accountId })
    );
    t.is(lockedBalance, 100);
});

test('Lock failures', async t => {
    const { jsvm, lockableFt, ali } = t.context.accounts;
    const error1 = await t.throwsAsync(() => lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'lock', { ownerId: lockableFt.accountId, lockAmount: 0 }),
        { attachedDeposit: '100000000000000000000000' }
    ));
    t.assert(error1.message.includes(`Can't lock 0 or less tokens`));

    const error2 = await t.throwsAsync(() => lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'lock', { ownerId: lockableFt.accountId, lockAmount: 10001 }),
        { attachedDeposit: '100000000000000000000000' }
    ));
    t.assert(error2.message.includes(`Not enough unlocked balance`));

    const error3 = await t.throwsAsync(() => ali.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'lock', { ownerId: lockableFt.accountId, lockAmount: 10 }),
        { attachedDeposit: '100000000000000000000000' }
    ));
    t.assert(error3.message.includes(`Not enough allowance`));
});

test('Unlock owner', async t => {
    const { jsvm, lockableFt, ali } = t.context.accounts;
    await lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'lock', { ownerId: lockableFt.accountId, lockAmount: 100 }),
        { attachedDeposit: '100000000000000000000000' }
    );
    await lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'unlock', { ownerId: lockableFt.accountId, unlockAmount: 100 }),
        { attachedDeposit: '100000000000000000000000' }
    );
    const unlockedBalance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getUnlockedBalance', { ownerId: lockableFt.accountId })
    );
    t.is(unlockedBalance, 10000);
    const allowance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getAllowance', { ownerId: lockableFt.accountId, escrowAccountId: lockableFt.accountId })
    );
    t.is(allowance, 0);
    const lockedBalance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getLockedBalance', { ownerId: lockableFt.accountId, escrowAccountId: lockableFt.accountId })
    );
    t.is(lockedBalance, 0);
});

test('Unlock failures', async t => {
    const { jsvm, lockableFt } = t.context.accounts;
    const error1 = await t.throwsAsync(() => lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'unlock', { ownerId: lockableFt.accountId, unlockAmount: 0 }),
        { attachedDeposit: '100000000000000000000000' }
    ));
    t.assert(error1.message.includes(`Can't unlock 0 or less tokens`));

    const error2 = await t.throwsAsync(() => lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'unlock', { ownerId: lockableFt.accountId, unlockAmount: 1 }),
        { attachedDeposit: '100000000000000000000000' }
    ));
    t.assert(error2.message.includes(`Not enough locked tokens`));
});

test('Simple transfer', async t => {
    const { jsvm, lockableFt, ali } = t.context.accounts;
    await lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'transfer', { newOwnerId: ali.accountId, amount: 100 }),
        { attachedDeposit: '100000000000000000000000' }
    );
    const ownerUnlockedBalance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getUnlockedBalance', { ownerId: lockableFt.accountId })
    );
    t.is(ownerUnlockedBalance, 9900);
    const aliUnlockedBalance = await jsvm.view(
        'view_js_contract',
        encodeCall(lockableFt.accountId, 'getUnlockedBalance', { ownerId: ali.accountId })
    );
    t.is(aliUnlockedBalance, 100);
});

test('Transfer failures', async t => {
    const { jsvm, lockableFt, ali } = t.context.accounts;
    const error1 = await t.throwsAsync(() => lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'transfer', { newOwnerId: ali.accountId, amount: 0 }),
        { attachedDeposit: '100000000000000000000000' }
    ));
    t.assert(error1.message.includes(`Can't transfer 0 or less tokens`));

    const error2 = await t.throwsAsync(() => lockableFt.call(
        jsvm,
        'call_js_contract',
        encodeCall(lockableFt.accountId, 'transfer', { newOwnerId: ali.accountId, amount: 10001 }),
        { attachedDeposit: '100000000000000000000000' }
    ));
    t.assert(error2.message.includes(`Not enough unlocked balance`));
});
