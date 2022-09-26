import { Worker } from 'near-workspaces'
import test from 'ava'

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init()

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount

  // Deploy the clean-state contract.
  const cleanState = await root.devDeploy('./build/clean-state.wasm')

  // Save state for test runs, it is unique for each test
  t.context.worker = worker
  t.context.accounts = {
    root,
    cleanState,
  }
})

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed tear down the worker:', error)
  })
})

test('Clean state after storing', async (t) => {
  const { root, cleanState } = t.context.accounts
  await root.call(cleanState, 'put', { key: '1', value: 1 })
  const value1 = await cleanState.view('get', { key: '1' })
  t.is(value1, '1')
  await cleanState.call(cleanState, 'clean', { keys: ['1'] })
  const value2 = await cleanState.view('get', { key: '1' })
  t.is(value2, null)
})
