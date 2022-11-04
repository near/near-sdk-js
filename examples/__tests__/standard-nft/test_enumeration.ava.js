import { Worker } from "near-workspaces";
import test from "ava";

async function helper_mint(nft, nftOwner, id, title, description) {
  let token_metadata = {
    title,
    description,
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
    [id, nftOwner.accountId, token_metadata],
    { attachedDeposit: "10 mN" }
  );
}

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

  await nftReceiver.call(nftReceiver, "init", nft.accountId);

  await helper_mint(
    nft,
    nftOwner,
    "0",
    "Olympus Mons",
    "The tallest mountain in the charted solar system"
  );
  await helper_mint(nft, nftOwner, "1", "Black as the Night", "In charcoal");
  await helper_mint(nft, nftOwner, "2", "Hamakua", "Vintage recording");
  await helper_mint(nft, nftOwner, "3", "Aloha ke akua", "Original with piano");

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

test("Enumerate NFT tokens total supply", async (t) => {
  const { nft } = t.context.accounts;

  let totalSupply = await nft.view("nft_total_supply");
  t.is(totalSupply, 4);
});

test("Enumerate NFT tokens", async (t) => {
  const { nft } = t.context.accounts;

  let nftTokens = await nft.view("nft_tokens", [1, null]);
  t.is(nftTokens.length, 3);
  t.is(nftTokens[0].token_id, "1");
  t.is(nftTokens[1].token_id, "2");
  t.is(nftTokens[2].token_id, "3");

  nftTokens = await nft.view("nft_tokens", [null, 2]);
  t.is(nftTokens.length, 2);
  t.is(nftTokens[0].token_id, "0");
  t.is(nftTokens[1].token_id, "1");
});

test("Enumerate NFT tokens supply for owner", async (t) => {
  const { ali, nft, nftOwner } = t.context.accounts;

  let aliNfts = await nft.view("nft_supply_for_owner", ali.accountId);
  t.is(aliNfts, 0);

  let ownerNfts = await nft.view("nft_supply_for_owner", nftOwner.accountId);
  t.is(ownerNfts, 4);
});

test("Enumerate NFT tokens for owner", async (t) => {
  const { ali, nft, nftOwner } = t.context.accounts;

  let nftTokens = await nft.view("nft_tokens_for_owner", [
    nftOwner.accountId,
    null,
    null,
  ]);
  t.is(nftTokens.length, 4);
  t.is(nftTokens[0].token_id, "0");
  t.is(nftTokens[1].token_id, "1");
  t.is(nftTokens[2].token_id, "2");
  t.is(nftTokens[3].token_id, "3");

  nftTokens = await nft.view("nft_tokens_for_owner", [
    nftOwner.accountId,
    1,
    null,
  ]);
  t.is(nftTokens.length, 3);
  t.is(nftTokens[0].token_id, "1");
  t.is(nftTokens[1].token_id, "2");
  t.is(nftTokens[2].token_id, "3");

  nftTokens = await nft.view("nft_tokens_for_owner", [
    nftOwner.accountId,
    null,
    2,
  ]);
  t.is(nftTokens.length, 2);
  t.is(nftTokens[0].token_id, "0");
  t.is(nftTokens[1].token_id, "1");

  let res = await nftOwner.callRaw(
    nft,
    "nft_transfer",
    [ali.accountId, "0", null, "simple transfer"],
    { attachedDeposit: "1" }
  );
  t.is(res.result.status.SuccessValue, "");

  nftTokens = await nft.view("nft_tokens_for_owner", [
    ali.accountId,
    null,
    null,
  ]);
  t.is(nftTokens.length, 1);

  nftTokens = await nft.view("nft_tokens_for_owner", [
    nftOwner.accountId,
    null,
    null,
  ]);
  t.is(nftTokens.length, 3);
  t.is(nftTokens[0].token_id, "3");
  t.is(nftTokens[1].token_id, "1");
  t.is(nftTokens[2].token_id, "2");
});
