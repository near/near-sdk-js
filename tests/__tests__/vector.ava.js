import { Worker } from 'near-workspaces'
import test from 'ava'

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init()

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount

  // Deploy the test contract.
  const vectorContract = await root.devDeploy('build/vector.wasm')

  // Test users
  const ali = await root.createSubAccount('ali')
  const bob = await root.createSubAccount('bob')
  const carl = await root.createSubAccount('carl')

  // Save state for test runs
  t.context.worker = worker
  t.context.accounts = { root, vectorContract, ali, bob, carl }
})

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to tear down the worker:', error)
  })
})

test('Vector is empty by default', async (t) => {
  const { root, vectorContract } = t.context.accounts
  let result = await vectorContract.view('len', {})
  t.is(result, 0)
  t.is(await vectorContract.view('isEmpty', {}), true)
})

test('Vector push, get, pop, replace', async (t) => {
  const { ali, vectorContract } = t.context.accounts
  await ali.call(vectorContract, 'push', { value: 'hello' })
  await ali.call(vectorContract, 'push', { value: 'world' })
  await ali.call(vectorContract, 'push', { value: 'aaa' })
  let result = await vectorContract.view('len', {})
  t.is(result, 3)
  t.is(await vectorContract.view('get', { index: 0 }), 'hello')
  t.is(await vectorContract.view('get', { index: 2 }), 'aaa')
  t.is(await vectorContract.view('get', { index: 3 }), null)

  await ali.call(vectorContract, 'pop', {})
  ;(result = await vectorContract.view('len', {})), t.is(result, 2)
  t.is(await vectorContract.view('get', { index: 2 }), null)
  t.is(await vectorContract.view('get', { index: 1 }), 'world')
  await ali.call(vectorContract, 'replace', { index: 1, value: 'aaa' })
  t.is(await vectorContract.view('get', { index: 1 }), 'aaa')
})

test('Vector extend, toArray, swapRemove, clear', async (t) => {
  const { ali, vectorContract } = t.context.accounts

  await ali.call(vectorContract, 'extend', { kvs: ['hello', 'world', 'aaa'] })

  t.deepEqual(await vectorContract.view('toArray', {}), ['hello', 'world', 'aaa'])

  // swapRemove non existing element should error
  const error1 = await t.throwsAsync(() => ali.call(vectorContract, 'swapRemove', { index: 3 }))
  t.assert(error1.message.includes(`Index out of bounds`))
  t.deepEqual(await vectorContract.view('toArray', {}), ['hello', 'world', 'aaa'])

  // swapRemove not the last one should work
  await ali.call(vectorContract, 'swapRemove', { index: 0 })
  t.deepEqual(await vectorContract.view('toArray', {}), ['aaa', 'world'])

  // swapRemove the last one should work
  await ali.call(vectorContract, 'swapRemove', { index: 1 })
  t.deepEqual(await vectorContract.view('toArray', {}), ['aaa'])

  // swapRemove when length is 1 should work
  t.is(await vectorContract.view('len', {}), 1)
  t.is(await vectorContract.view('isEmpty', {}), false)
  await ali.call(vectorContract, 'swapRemove', { index: 0 })
  t.deepEqual(await vectorContract.view('toArray', {}), [])
  t.is(await vectorContract.view('isEmpty', {}), true)

  await ali.call(vectorContract, 'extend', { kvs: ['hello', 'world', 'aaa'] })
  t.is(await vectorContract.view('isEmpty', {}), false)
  await ali.call(vectorContract, 'clear', {})

  t.deepEqual(await vectorContract.view('toArray', {}), [])
  t.is(await vectorContract.view('isEmpty', {}), true)
})

test('Vector add and get object', async (t) => {
  const { ali, vectorContract } = t.context.accounts
  await ali.call(vectorContract, 'add_house', {})
  let result = await vectorContract.view('get_house', {})
  t.deepEqual(result, {
    name: 'house1',
    rooms: [
      {
        name: 'room1',
        size: '200sqft',
      },
      {
        name: 'room2',
        size: '300sqft',
      },
    ],
  })
})
