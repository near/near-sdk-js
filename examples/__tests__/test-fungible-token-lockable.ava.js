import { Worker } from 'near-workspaces'
import test from 'ava'

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init()

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount

  // Deploy the lockable-ft contract.
  const lockableFt = await root.devDeploy('./build/fungible-token-lockable.wasm')

  // Init the contract
  await lockableFt.call(lockableFt, 'init', {
    prefix: 'prefix',
    totalSupply: 10000,
  })

  // Test users
  const ali = await root.createSubAccount('ali')
  const bob = await root.createSubAccount('bob')

  // Save state for test runs
  t.context.worker = worker
  t.context.accounts = { root, lockableFt, ali, bob }
})

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to tear down the worker:', error)
  })
})

test('Owner initial details', async (t) => {
  const { lockableFt } = t.context.accounts
  const totalSupply = await lockableFt.view('getTotalSupply', {})
  t.is(totalSupply, 10000)
  const totalBalance = await lockableFt.view('getTotalBalance', {
    ownerId: lockableFt.accountId,
  })
  t.is(totalBalance, 10000)
  const unlockedBalance = await lockableFt.view('getUnlockedBalance', {
    ownerId: lockableFt.accountId,
  })
  t.is(unlockedBalance, 10000)
  const allowance = await lockableFt.view('getAllowance', {
    ownerId: lockableFt.accountId,
    escrowAccountId: lockableFt.accountId,
  })
  t.is(allowance, 0)
  const lockedBalance = await lockableFt.view('getLockedBalance', {
    ownerId: lockableFt.accountId,
    escrowAccountId: lockableFt.accountId,
  })
  t.is(lockedBalance, 0)
})

test('Set allowance', async (t) => {
  const { lockableFt, ali } = t.context.accounts
  await lockableFt.call(lockableFt, 'setAllowance', {
    escrowAccountId: ali.accountId,
    allowance: 100,
  })
  const aliAllowance = await lockableFt.view('getAllowance', {
    ownerId: lockableFt.accountId,
    escrowAccountId: ali.accountId,
  })
  t.is(aliAllowance, 100)
  const contractAllowance = await lockableFt.view('getAllowance', {
    ownerId: lockableFt.accountId,
    escrowAccountId: lockableFt.accountId,
  })
  t.is(contractAllowance, 0)
})

test('Fail to set allowance for oneself', async (t) => {
  const { lockableFt } = t.context.accounts
  const error = await t.throwsAsync(() =>
    lockableFt.call(lockableFt, 'setAllowance', {
      escrowAccountId: lockableFt.accountId,
      allowance: 100,
    })
  )
  t.assert(error.message.includes(`Can't set allowance for yourself`))
})

test('Lock owner', async (t) => {
  const { lockableFt } = t.context.accounts
  await lockableFt.call(lockableFt, 'lock', {
    ownerId: lockableFt.accountId,
    lockAmount: 100,
  })
  const unlockedBalance = await lockableFt.view('getUnlockedBalance', {
    ownerId: lockableFt.accountId,
  })
  t.is(unlockedBalance, 9900)
  const allowance = await lockableFt.view('getAllowance', {
    ownerId: lockableFt.accountId,
    escrowAccountId: lockableFt.accountId,
  })
  t.is(allowance, 0)
  const lockedBalance = await lockableFt.view('getLockedBalance', {
    ownerId: lockableFt.accountId,
    escrowAccountId: lockableFt.accountId,
  })
  t.is(lockedBalance, 100)
})

test('Lock failures', async (t) => {
  const { lockableFt, ali } = t.context.accounts
  const error1 = await t.throwsAsync(() =>
    lockableFt.call(lockableFt, 'lock', {
      ownerId: lockableFt.accountId,
      lockAmount: 0,
    })
  )
  t.assert(error1.message.includes(`Can't lock 0 or less tokens`))

  const error2 = await t.throwsAsync(() =>
    lockableFt.call(lockableFt, 'lock', {
      ownerId: lockableFt.accountId,
      lockAmount: 10001,
    })
  )
  t.assert(error2.message.includes(`Not enough unlocked balance`))

  const error3 = await t.throwsAsync(() =>
    ali.call(lockableFt, 'lock', {
      ownerId: lockableFt.accountId,
      lockAmount: 10,
    })
  )
  t.assert(error3.message.includes(`Not enough allowance`))
})

test('Unlock owner', async (t) => {
  const { lockableFt } = t.context.accounts
  await lockableFt.call(lockableFt, 'lock', {
    ownerId: lockableFt.accountId,
    lockAmount: 100,
  })
  await lockableFt.call(lockableFt, 'unlock', {
    ownerId: lockableFt.accountId,
    unlockAmount: 100,
  })
  const unlockedBalance = await lockableFt.view('getUnlockedBalance', {
    ownerId: lockableFt.accountId,
  })
  t.is(unlockedBalance, 10000)
  const allowance = await lockableFt.view('getAllowance', {
    ownerId: lockableFt.accountId,
    escrowAccountId: lockableFt.accountId,
  })
  t.is(allowance, 0)
  const lockedBalance = await lockableFt.view('getLockedBalance', {
    ownerId: lockableFt.accountId,
    escrowAccountId: lockableFt.accountId,
  })
  t.is(lockedBalance, 0)
})

test('Unlock failures', async (t) => {
  const { lockableFt } = t.context.accounts
  const error1 = await t.throwsAsync(() =>
    lockableFt.call(lockableFt, 'unlock', {
      ownerId: lockableFt.accountId,
      unlockAmount: 0,
    })
  )
  t.assert(error1.message.includes(`Can't unlock 0 or less tokens`))

  const error2 = await t.throwsAsync(() =>
    lockableFt.call(lockableFt, 'unlock', {
      ownerId: lockableFt.accountId,
      unlockAmount: 1,
    })
  )
  t.assert(error2.message.includes(`Not enough locked tokens`))
})

test('Simple transfer', async (t) => {
  const { lockableFt, ali } = t.context.accounts
  await lockableFt.call(lockableFt, 'transfer', {
    newOwnerId: ali.accountId,
    amount: 100,
  })
  const ownerUnlockedBalance = await lockableFt.view('getUnlockedBalance', {
    ownerId: lockableFt.accountId,
  })
  t.is(ownerUnlockedBalance, 9900)
  const aliUnlockedBalance = await lockableFt.view('getUnlockedBalance', {
    ownerId: ali.accountId,
  })
  t.is(aliUnlockedBalance, 100)
})

test('Transfer failures', async (t) => {
  const { lockableFt, ali } = t.context.accounts
  const error1 = await t.throwsAsync(() =>
    lockableFt.call(lockableFt, 'transfer', {
      newOwnerId: ali.accountId,
      amount: 0,
    })
  )
  t.assert(error1.message.includes(`Can't transfer 0 or less tokens`))

  const error2 = await t.throwsAsync(() =>
    lockableFt.call(lockableFt, 'transfer', {
      newOwnerId: ali.accountId,
      amount: 10001,
    })
  )
  t.assert(error2.message.includes(`Not enough unlocked balance`))
})
