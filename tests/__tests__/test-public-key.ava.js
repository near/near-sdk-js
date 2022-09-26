import { Worker } from 'near-workspaces'
import test from 'ava'

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init()

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount

  // Create and deploy test contract
  const pkContract = await root.createSubAccount('pk')
  await pkContract.deploy('build/public-key.wasm')

  // Test users
  const ali = await root.createSubAccount('ali')
  const bob = await root.createSubAccount('bob')
  const carl = await root.createSubAccount('carl')

  // Save state for test runs
  t.context.worker = worker
  t.context.accounts = { root, pkContract, ali, bob, carl }
})

test.after.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to tear down the worker:', error)
  })
})

test('add signer key should success', async (t) => {
  const { ali, pkContract } = t.context.accounts
  let r = await ali.callRaw(pkContract, 'test_add_signer_key', '')
  t.is(r.result.status.SuccessValue, '')
})

test('add ed25519 key bytes should success', async (t) => {
  const { ali, pkContract } = t.context.accounts
  let r = await ali.callRaw(pkContract, 'test_add_ed25519_key_bytes', '')
  t.is(r.result.status.SuccessValue, '')
})

test('add ed25519 key string should success', async (t) => {
  const { ali, pkContract } = t.context.accounts
  let r = await ali.callRaw(pkContract, 'test_add_ed25519_key_string', '')
  t.is(r.result.status.SuccessValue, '')
})

test('add secp256k1 key bytes should success', async (t) => {
  const { bob, pkContract } = t.context.accounts
  let r = await bob.callRaw(pkContract, 'test_add_secp256k1_key_bytes', '')
  t.is(r.result.status.SuccessValue, '')
})

test('add secp256k1 key string should success', async (t) => {
  const { bob, pkContract } = t.context.accounts
  let r = await bob.callRaw(pkContract, 'test_add_secp256k1_key_string', '', {
    gas: '100 Tgas',
  })
  t.is(r.result.status.SuccessValue, '')
})

test('add invalid key should error', async (t) => {
  const { bob, pkContract } = t.context.accounts
  let r = await bob.callRaw(pkContract, 'add_invalid_public_key', '')
  t.is(r.result.status.SuccessValue, undefined)
  t.is(
    r.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError,
    'VM Logic provided an invalid public key'
  )
})

test('curve type check should success', async (t) => {
  const { carl, pkContract } = t.context.accounts
  let r = await carl.callRaw(pkContract, 'curve_type', '')
  t.is(r.result.status.SuccessValue, '')
})

test('create invalid curve type should fail', async (t) => {
  const { carl, pkContract } = t.context.accounts
  let r = await carl.callRaw(pkContract, 'create_invalid_curve_type', '')
  t.is(r.result.status.SuccessValue, undefined)
  t.assert(
    r.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.startsWith(
      'Smart contract panicked: Unknown curve'
    )
  )
})

test('create invalid length should fail', async (t) => {
  const { carl, pkContract } = t.context.accounts
  let r = await carl.callRaw(pkContract, 'create_invalid_length', '')
  t.is(r.result.status.SuccessValue, undefined)
  t.assert(
    r.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.startsWith(
      'Smart contract panicked: Invalid length'
    )
  )
})

test('create invalid base58 should fail', async (t) => {
  const { carl, pkContract } = t.context.accounts
  let r = await carl.callRaw(pkContract, 'create_from_invalid_base58', '')
  t.is(r.result.status.SuccessValue, undefined)
  t.assert(
    r.result.status.Failure.ActionError.kind.FunctionCallError.ExecutionError.startsWith(
      'Smart contract panicked: Base58 error'
    )
  )
})
