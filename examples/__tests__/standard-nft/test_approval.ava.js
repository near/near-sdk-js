import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy status-message the contract.
  const nft = await root.devDeploy("./build/my-nft.wasm");

  // Create test accounts
  const ali = await root.createSubAccount("alice");
  const bob = await root.createSubAccount("bob");
  const nftOwner = await root.createSubAccount("owner");
  const nftReceiver = await root.devDeploy("./build/nft-receiver.wasm");
  const approvalReceiver = await root.devDeploy(
    "./build/nft-approval-receiver.wasm"
  );

  await nft.call(nft, "init", {
    owner_id: nftOwner.accountId,
    metadata: { spec: "nft-1.0.0", name: "My NFT", symbol: "NFT" },
  });

  await nftReceiver.call(nftReceiver, "init", {
    non_fungible_token_account_id: nft.accountId,
  });
  await approvalReceiver.call(approvalReceiver, "init", {
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
    approvalReceiver,
  };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed tear down the worker:", error);
  });
});

test("Simple approve", async (t) => {
  const { ali, bob, nft, nftOwner } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_approve",
    {
      token_id: "0",
      account_id: ali.accountId,
    },
    { attachedDeposit: "510000000000000000000" }
  );
  t.assert(res.result.status.SuccessValue);

  let alice_approved = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: ali.accountId,
  });
  t.assert(alice_approved);

  let alice_approval_id_is_1 = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: ali.accountId,
    approval_id: "1",
  });
  t.assert(alice_approval_id_is_1);

  let alice_approval_id_is_2 = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: ali.accountId,
    approval_id: "2",
  });
  t.assert(!alice_approval_id_is_2);

  res = await nftOwner.callRaw(
    nft,
    "nft_approve",
    {
      token_id: "0",
      account_id: ali.accountId,
    },
    {
      attachedDeposit: "1",
    }
  );
  t.assert(res.result.status.SuccessValue);
  alice_approval_id_is_2 = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: ali.accountId,
    approval_id: "2",
  });
  t.assert(alice_approval_id_is_2);

  res = await nftOwner.callRaw(
    nft,
    "nft_approve",
    {
      token_id: "0",
      account_id: bob.accountId,
    },
    {
      attachedDeposit: "550000000000000000000",
    }
  );
  t.assert(res.result.status.SuccessValue);

  let bob_approval_id_is_3 = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: bob.accountId,
    approval_id: "3",
  });
  t.assert(bob_approval_id_is_3);
});

test("Approve call", async (t) => {
  const { nft, nftOwner, approvalReceiver } = t.context.accounts;

  let res = await nftOwner.call(
    nft,
    "nft_approve",
    {
      token_id: "0",
      account_id: approvalReceiver.accountId,
      msg: "return-now",
    },
    { attachedDeposit: "550000000000000000000", gas: "300 Tgas" }
  );
  t.is(res, "cool");

  res = await nftOwner.call(
    nft,
    "nft_approve",
    {
      token_id: "0",
      account_id: approvalReceiver.accountId,
      msg: "hahaha",
    },
    { attachedDeposit: "1", gas: "300 Tgas" }
  );
  t.is(res, "hahaha");
});

test("Approved account transfers token", async (t) => {
  const { ali, nft, nftOwner } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_approve",
    {
      token_id: "0",
      account_id: ali.accountId,
    },
    { attachedDeposit: "510000000000000000000" }
  );
  t.assert(res.result.status.SuccessValue);

  let token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, nftOwner.accountId);

  res = await ali.callRaw(
    nft,
    "nft_transfer",
    {
      receiver_id: ali.accountId,
      token_id: "0",
      memo: "gotcha! bahahaha",
    },
    { attachedDeposit: "1" }
  );
  t.is(res.result.status.SuccessValue, "");

  token = await nft.view("nft_token", { token_id: "0" });
  t.is(token.owner_id, ali.accountId);
});

test("revoke", async (t) => {
  const { ali, bob, nft, nftOwner } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_approve",
    {
      token_id: "0",
      account_id: ali.accountId,
    },
    { attachedDeposit: "510000000000000000000" }
  );
  t.assert(res.result.status.SuccessValue);

  res = await nftOwner.callRaw(
    nft,
    "nft_approve",
    {
      token_id: "0",
      account_id: bob.accountId,
    },
    {
      attachedDeposit: "510000000000000000000",
    }
  );
  t.assert(res.result.status.SuccessValue);

  res = await nftOwner.callRaw(
    nft,
    "nft_revoke",
    {
      token_id: "0",
      account_id: ali.accountId,
    },
    {
      attachedDeposit: "1",
    }
  );
  t.is(res.result.status.SuccessValue, "");

  let alice_approved = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: ali.accountId,
  });
  t.assert(!alice_approved);

  let bob_approved = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: bob.accountId,
  });
  t.assert(bob_approved);

  res = await nftOwner.callRaw(
    nft,
    "nft_revoke",
    {
      token_id: "0",
      account_id: bob.accountId,
    },
    {
      attachedDeposit: "1",
    }
  );
  t.is(res.result.status.SuccessValue, "");

  alice_approved = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: ali.accountId,
  });
  t.assert(!alice_approved);

  bob_approved = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: bob.accountId,
  });
  t.assert(!bob_approved);
});

test("revoke all", async (t) => {
  const { ali, bob, nft, nftOwner } = t.context.accounts;

  let res = await nftOwner.callRaw(
    nft,
    "nft_approve",
    {
      token_id: "0",
      accountId: ali.accountId,
    },
    { attachedDeposit: "510000000000000000000" }
  );
  t.assert(res.result.status.SuccessValue);

  res = await nftOwner.callRaw(
    nft,
    "nft_approve",
    {
      token_id: "0",
      accountId: bob.accountId,
    },
    {
      attachedDeposit: "510000000000000000000",
    }
  );
  t.assert(res.result.status.SuccessValue);

  res = await nftOwner.callRaw(
    nft,
    "nft_revoke_all",
    { token_id: "0" },
    {
      attachedDeposit: "1",
    }
  );
  t.is(res.result.status.SuccessValue, "");

  let alice_approved = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: ali.accountId,
  });
  t.assert(!alice_approved);

  let bob_approved = await nft.view("nft_is_approved", {
    token_id: "0",
    approved_account_id: bob.accountId,
  });
  t.assert(!bob_approved);
});
