import { Worker } from 'near-workspaces';
import test from 'ava';

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the contract.
  const guestBook = await root.devDeploy('./build/guest-book-borsh.wasm');

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, guestBook };
});

test.after.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to tear down the worker:', error);
  });
});

test('Root adds non-premium message then gets', async (t) => {
  const { guestBook, root } = t.context.accounts;
  const messagesBefore = await guestBook.view('get_messages', {});
  t.is(messagesBefore.length, 0);

  await root.call(guestBook, 'add_message', { text: 'Some usual text' });

  const messagesAfter = await guestBook.view('get_messages', {});
  t.is(messagesAfter.length, 1);
  t.is(messagesAfter[0].text, 'Some usual text');
});
