import { Worker } from "near-workspaces";
import test from "ava";

const MAX_GAS = 300_000_000_000_000n;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy status-message the contract.
  const nft = await root.devDeploy("./build/my-nft.wasm");

  // Create test accounts
  const ali = await root.createSubAccount("ali");
  const bob = await root.createSubAccount("bob");
  const nftOwner = await root.createSubAccount("owner");
  const nftReceiver = await root.devDeploy("./build/nft-receiver.wasm");

  await nft.call(nft, "init", {
    owner_id: nftOwner.accountId,
    metadata: { spec: "nft-1.0.0", name: "My NFT", symbol: "NFT" },
  });

  await nftReceiver.call(nftReceiver, "init", {
    non_fungible_token_account_id: nft.accountId,
  });

  let token_metadata = {
    title: "Olympus Mons",
    description: "The tallest mountain in the charted solar system",
    media: null,
    media_hash: null,
    copies: 1,
    issued_at: null,
    expires_at: null,
    starts_at: null,
    updated_at: null,
    extra: null,
    reference: null,
    reference_hash: null,
  };
  await nftOwner.call(
    nft,
    "nft_mint",
    {
      token_id: "0",
      token_owner_id: nftOwner.accountId,
      token_metadata,
    },
    { attachedDeposit: "10 mN" }
  );

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = {
    root,
    nft,
    ali,
    bob,
    nftOwner,
    nftReceiver,
  };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed tear down the worker:", error);
  });
});

test("Simple transfer", async (t) => {
  const { ali, nft, nftOwner } = t.context.accounts;

  let token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftOwner.accountId);

  let res = await nftOwner.callRaw(
    nft,
    "nft_transfer",
    {
      receiver_id: ali.accountId,
      token_id: "0",
      memo: "simple transfer",
    },
    { attachedDeposit: "1" }
  );
  t.is(res.result.status.SuccessValue, "");

  t.is(res.logs.length, 1);

  token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, ali.accountId);
});

test("Transfer call fast return to sender", async (t) => {
  const { nft, nftOwner, nftReceiver } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_transfer_call",
    {
      receiver_id: nftReceiver.accountId,
      token_id: "0",
      memo: "transfer & call",
      msg: "return-it-now",
    },
    { attachedDeposit: "1", gas: MAX_GAS }
  );
  t.is(
    Buffer.from(res.result.status.SuccessValue, "base64").toString(),
    "false"
  );

  let token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftOwner.accountId);
});

test("Transfer call slow return to sender", async (t) => {
  const { nft, nftOwner, nftReceiver } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_transfer_call",
    {
      receiver_id: nftReceiver.accountId,
      token_id: "0",
      memo: "transfer & call",
      msg: "return-it-later",
    },
    { attachedDeposit: "1", gas: MAX_GAS }
  );
  t.is(
    Buffer.from(res.result.status.SuccessValue, "base64").toString(),
    "false"
  );

  let token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftOwner.accountId);
});

test("Transfer call fast keep with sender", async (t) => {
  const { nft, nftOwner, nftReceiver } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_transfer_call",
    {
      receiver_id: nftReceiver.accountId,
      token_id: "0",
      memo: "transfer & call",
      msg: "keep-it-now",
    },
    { attachedDeposit: "1", gas: MAX_GAS }
  );
  t.is(
    Buffer.from(res.result.status.SuccessValue, "base64").toString(),
    "true"
  );

  let token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftReceiver.accountId);
});

test("Transfer call slow keep with sender", async (t) => {
  const { nft, nftOwner, nftReceiver } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_transfer_call",
    {
      receiver_id: nftReceiver.accountId,
      token_id: "0",
      memo: "transfer & call",
      msg: "keep-it-later",
    },
    { attachedDeposit: "1", gas: MAX_GAS }
  );
  t.is(
    Buffer.from(res.result.status.SuccessValue, "base64").toString(),
    "true"
  );

  let token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftReceiver.accountId);
});

test("Transfer call receiver panics", async (t) => {
  const { nft, nftOwner, nftReceiver } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_transfer_call",
    {
      receiver_id: nftReceiver.accountId,
      token_id: "0",
      memo: "transfer & call",
      msg: "incorrect message",
    },
    { attachedDeposit: "1", gas: MAX_GAS }
  );
  t.is(
    Buffer.from(res.result.status.SuccessValue, "base64").toString(),
    "false"
  );

  t.is(res.logs.length, 3);

  let token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftOwner.accountId);
});

test("Transfer call receiver panics and nft_resolve_transfer produces no log if not enough gas", async (t) => {
  const { nft, nftOwner, nftReceiver } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_transfer_call",
    {
      receiver_id: nftReceiver.accountId,
      token_id: "0",
      memo: "transfer & call",
      msg: "incorrect message",
    },
    { attachedDeposit: "1", gas: 30_000_000_000_000n }
  );
  t.assert(res.result.status.Failure !== undefined);

  t.is(res.logs.length, 0);

  let token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftOwner.accountId);
});

test("Simple transfer no logs on failure", async (t) => {
  const { nft, nftOwner } = t.context.accounts;

  let token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftOwner.accountId);

  // transfer to the current owner should fail and not print log
  let res = await nftOwner.callRaw(
    nft,
    "nft_transfer",
    {
      receiver_id: nftOwner.accountId,
      token_id: "0",
      memo: "simple transfer",
    },
    { attachedDeposit: "1" }
  );
  t.assert(res.result.status.Failure !== undefined);

  t.is(res.logs.length, 0);

  token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftOwner.accountId);
});
