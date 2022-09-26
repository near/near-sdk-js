import { Worker } from 'near-workspaces'
import test from 'ava'

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init()

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount

  // Deploy the test contract.
  const contextApiContract = await root.devDeploy('build/context_api.wasm')

  // Test users
  const ali = await root.createSubAccount('ali')
  const bob = await root.createSubAccount('bob')
  const carl = await root.createSubAccount('carl')

  // Save state for test runs
  t.context.worker = worker
  t.context.accounts = { root, contextApiContract, ali, bob, carl }
})

test.after.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to tear down the worker:', error)
  })
})

test('get current account id correct', async (t) => {
  const { ali, contextApiContract } = t.context.accounts
  let r = await ali.call(contextApiContract, 'get_current_account_id', '')
  t.is(r, contextApiContract.accountId)
})

test('get signer account id correct', async (t) => {
  const { ali, contextApiContract } = t.context.accounts
  let r = await ali.call(contextApiContract, 'get_signer_account_id', '')
  t.is(r, ali.accountId)
})

test('get predecessor account id correct', async (t) => {
  const { ali, contextApiContract } = t.context.accounts
  let r = await ali.call(contextApiContract, 'get_predecessor_account_id', '')
  t.is(r, ali.accountId)
})

test('get signer account pk correct', async (t) => {
  const { ali, contextApiContract } = t.context.accounts
  let r = await ali.callRaw(contextApiContract, 'get_signer_account_pk', '')
  // the prefixing byte 0 indicates it's a ED25519 PublicKey, see how PublicKey is serialized in nearcore
  t.deepEqual(
    Buffer.from(r.result.status.SuccessValue, 'base64'),
    Buffer.concat([Buffer.from([0]), Buffer.from((await ali.getKey(ali.accountId)).getPublicKey().data)])
  )
})

test('get input correct', async (t) => {
  const { bob, contextApiContract } = t.context.accounts
  let r = await bob.callRaw(contextApiContract, 'get_input', new Uint8Array([0, 1, 255]))
  t.is(r.result.status.SuccessValue, Buffer.from(new Uint8Array([0, 1, 255])).toString('base64'))
})

test('get storage usage', async (t) => {
  const { carl, contextApiContract } = t.context.accounts
  let r = await carl.call(contextApiContract, 'get_storage_usage', '', {
    gas: '10 TGas',
  })
  t.is(r > 0, true)
})

test('get block height', async (t) => {
  const { bob, contextApiContract } = t.context.accounts
  let r = await bob.call(contextApiContract, 'get_block_height', '')
  t.is(r > 0, true)
})

test('get block timestamp', async (t) => {
  let time = new Date().getTime() * 1e6
  const { bob, contextApiContract } = t.context.accounts
  let r = await bob.call(contextApiContract, 'get_block_timestamp', '')
  t.is(r > time, true)
})

test('get epoch height', async (t) => {
  const { bob, contextApiContract } = t.context.accounts
  let r = await bob.call(contextApiContract, 'get_epoch_height', '')
  t.is(r, 1)
})

test('get attached deposit', async (t) => {
  const { carl, contextApiContract } = t.context.accounts
  let r = await carl.call(contextApiContract, 'get_attached_deposit', '', {
    attachedDeposit: 3,
  })
  t.is(r, 3)
})

test('get prepaid gas', async (t) => {
  const { carl, contextApiContract } = t.context.accounts
  let r = await carl.call(contextApiContract, 'get_prepaid_gas', '', {
    gas: '10 TGas',
  })
  t.is(r, 10000000000000)
})

test('get used gas', async (t) => {
  const { carl, contextApiContract } = t.context.accounts
  let r = await carl.call(contextApiContract, 'get_used_gas', '', {
    gas: '10 TGas',
  })
  t.is(r > 0, true)
  t.is(r < 10000000000000, true)
})

test('get random seed', async (t) => {
  const { carl, contextApiContract } = t.context.accounts
  let r = await carl.callRaw(contextApiContract, 'get_random_seed', '')
  t.is(Buffer.from(r.result.status.SuccessValue, 'base64').length, 32)
})

test('get validator stake test', async (t) => {
  const { carl, contextApiContract, root } = t.context.accounts
  let r = await carl.call(contextApiContract, 'get_validator_stake', '')
  t.is(r, 0)
  r = await root.callRaw(contextApiContract, 'get_validator_stake', '')
  t.is(Buffer.from(r.result.status.SuccessValue, 'base64').toString('ascii'), '50000000000000000000000000000000')
  r = await contextApiContract.viewRaw('get_total_stake', '')
  t.is(Buffer.from(r.result).toString('ascii'), '50000000000000000000000000000000')
})
