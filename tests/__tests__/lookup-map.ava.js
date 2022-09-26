import { Worker } from 'near-workspaces'
import test from 'ava'

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init()

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount

  // Deploy the test contract.
  const lookupMapContract = await root.devDeploy('build/lookup-map.wasm')

  // Test users
  const ali = await root.createSubAccount('ali')
  const bob = await root.createSubAccount('bob')
  const carl = await root.createSubAccount('carl')

  // Save state for test runs
  t.context.worker = worker
  t.context.accounts = { root, lookupMapContract, ali, bob, carl }
})

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to tear down the worker:', error)
  })
})

test('LookupMap set() get()', async (t) => {
  const { ali, lookupMapContract } = t.context.accounts

  t.is(await lookupMapContract.view('get', { key: 'hello' }), null)
  t.is(await lookupMapContract.view('containsKey', { key: 'hello' }), false)

  await ali.call(lookupMapContract, 'set', { key: 'hello', value: 'world' })

  t.is(await lookupMapContract.view('get', { key: 'hello' }), 'world')
  t.is(await lookupMapContract.view('containsKey', { key: 'hello' }), true)
})

test('LookupMap update, remove', async (t) => {
  const { ali, lookupMapContract } = t.context.accounts

  await ali.call(lookupMapContract, 'set', { key: 'hello', value: 'world' })
  await ali.call(lookupMapContract, 'set', { key: 'hello1', value: 'world0' })

  // update a value, len shouldn't change
  await ali.call(lookupMapContract, 'set', { key: 'hello1', value: 'world1' })
  // update should have effect
  t.is(await lookupMapContract.view('get', { key: 'hello1' }), 'world1')
  // not update key should not changed
  t.is(await lookupMapContract.view('get', { key: 'hello' }), 'world')
  // remove non existing element should not error
  await ali.call(lookupMapContract, 'remove_key', { key: 'hello3' })
  // remove existing key should work
  await ali.call(lookupMapContract, 'remove_key', { key: 'hello1' })
  t.is(await lookupMapContract.view('containsKey', { key: 'hello1' }), false)
  // not removed key should not affected
  t.is(await lookupMapContract.view('get', { key: 'hello' }), 'world')
})

test('LookupMap extend', async (t) => {
  const { ali, lookupMapContract } = t.context.accounts

  await ali.call(lookupMapContract, 'extend', {
    kvs: [
      ['hello', 'world'],
      ['hello1', 'world1'],
      ['hello2', 'world2'],
    ],
  })
  t.is(await lookupMapContract.view('get', { key: 'hello' }), 'world')
  t.is(await lookupMapContract.view('get', { key: 'hello1' }), 'world1')
  t.is(await lookupMapContract.view('get', { key: 'hello2' }), 'world2')
})

test('LookupMap set get object', async (t) => {
  const { ali, lookupMapContract } = t.context.accounts
  await ali.call(lookupMapContract, 'add_house', {})
  t.is(await lookupMapContract.view('get_house', {}), 'house house1 has 2 rooms. room room1 is 200sqft.')
})

test('LookupMap allows you to use the same key for the second time', async (t) => {
  const { ali, lookupMapContract } = t.context.accounts

  await ali.call(lookupMapContract, 'set', { key: 'hello', value: 'world' })
  await ali.call(lookupMapContract, 'set', { key: 'hello', value: 'world' })

  t.is(await lookupMapContract.view('get', { key: 'hello' }), 'world')
})
