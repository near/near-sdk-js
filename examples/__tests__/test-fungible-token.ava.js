import { Worker, NEAR } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  const worker = await Worker.init();

  const totalSupply = 1000;
  const yoctoAccountStorage = "324";

  const root = worker.rootAccount;
  const xcc = await root.devDeploy("./build/fungible-token-helper.wasm");
  const ft = await root.createSubAccount("ft");
  await ft.deploy("./build/fungible-token.wasm");
  await root.call(ft, "init", {
    owner_id: root.accountId,
    total_supply: totalSupply.toString(),
  });
  const alice = await root.createSubAccount("alice", {
    initialBalance: NEAR.parse("10 N").toJSON(),
  });

  t.context.worker = worker;
  t.context.accounts = { root, ft, alice, xcc };
  t.context.variables = { totalSupply, yoctoAccountStorage };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("should register account and pay for storage", async (t) => {
  const { ft, alice } = t.context.accounts;
  const { yoctoAccountStorage } = t.context.variables;
  const result = await alice.call(
    ft,
    "storage_deposit",
    { account_id: alice.accountId },
    { attachedDeposit: NEAR.parse("1 N").toJSON() }
  );
  const aliceAfterBalance = await alice.balance();
  const expected = {
    message: `Account ${alice.accountId} registered with storage deposit of ${yoctoAccountStorage}`,
  };
  t.deepEqual(result, expected);
  t.true(
    aliceAfterBalance.total > NEAR.parse("9 N").toJSON(),
    "alice should have received a refund"
  );
});

test("should return message when account is already registered and not refund when no deposit is attached", async (t) => {
  const { ft, alice } = t.context.accounts;
  const { yoctoAccountStorage } = t.context.variables;
  const result = await alice.call(
    ft,
    "storage_deposit",
    { account_id: alice.accountId },
    { attachedDeposit: NEAR.parse("1 N").toJSON() }
  );
  const expected = {
    message: `Account ${alice.accountId} registered with storage deposit of ${yoctoAccountStorage}`,
  };
  t.deepEqual(result, expected);
  const result2 = await alice.call(
    ft,
    "storage_deposit",
    { account_id: alice.accountId },
    { attachedDeposit: NEAR.parse("0 N").toJSON() }
  );
  t.is(result2.message, "Account is already registered");
});

test("should return message and refund predecessor caller when trying to pay for storage for an account that is already registered", async (t) => {
  const { ft, alice } = t.context.accounts;
  const { yoctoAccountStorage } = t.context.variables;
  const result = await alice.call(
    ft,
    "storage_deposit",
    { account_id: alice.accountId },
    { attachedDeposit: NEAR.parse("1 N").toJSON() }
  );
  const expected = {
    message: `Account ${alice.accountId} registered with storage deposit of ${yoctoAccountStorage}`,
  };
  t.deepEqual(result, expected);
  const result2 = await alice.call(
    ft,
    "storage_deposit",
    { account_id: alice.accountId },
    { attachedDeposit: NEAR.parse("1 N").toJSON() }
  );
  t.is(
    result2.message,
    "Account is already registered, deposit refunded to predecessor"
  );
  const aliceBalance = await alice.balance();
  t.is(
    aliceBalance.total > NEAR.parse("9 N"),
    true,
    "alice should have received a refund"
  );
});

test("should return message when trying to pay for storage with less than the required amount and refund predecessor caller", async (t) => {
  const { ft, alice } = t.context.accounts;
  const { yoctoAccountStorage } = t.context.variables;
  const result = await alice.call(
    ft,
    "storage_deposit",
    { account_id: alice.accountId },
    { attachedDeposit: NEAR.from("100").toJSON() }
  );
  t.is(
    result.message,
    `Not enough attached deposit to cover storage cost. Required: ${yoctoAccountStorage}`
  );
});

test("should throw when trying to transfer for an unregistered account", async (t) => {
  const { ft, alice, root } = t.context.accounts;
  try {
    await root.call(
      ft,
      "ft_transfer",
      { receiver_id: alice.accountId, amount: "1" },
      { attachedDeposit: NEAR.from("1").toJSON() }
    );
  } catch (error) {
    t.true(
      error.message.includes(`Account ${alice.accountId} is not registered`)
    );
  }
});

test("Owner has all balance in the beginning", async (t) => {
  const { ft, root } = t.context.accounts;
  const result = await ft.view("ft_balance_of", { account_id: root.accountId });
  t.is(result, "1000");
});

test("Can transfer if balance is sufficient", async (t) => {
  const { alice, ft, root } = t.context.accounts;
  await alice.call(
    ft,
    "storage_deposit",
    { account_id: alice.accountId },
    { attachedDeposit: NEAR.parse("1 N").toJSON() }
  );
  await root.call(
    ft,
    "ft_transfer",
    { receiver_id: alice.accountId, amount: "100" },
    { attachedDeposit: NEAR.from("1").toJSON() }
  );
  const aliBalance = await ft.view("ft_balance_of", {
    account_id: alice.accountId,
  });
  t.is(aliBalance, "100");
  const ownerBalance = await ft.view("ft_balance_of", {
    account_id: root.accountId,
  });
  t.is(ownerBalance, "900");
});

test("Cannot transfer if balance is not sufficient", async (t) => {
  const { alice, root, ft } = t.context.accounts;
  await alice.call(
    ft,
    "storage_deposit",
    { account_id: alice.accountId },
    { attachedDeposit: NEAR.parse("1 N").toJSON() }
  );
  try {
    await alice.call(
      ft,
      "ft_transfer",
      {
        receiverId: root.accountId,
        amount: "100",
      },
      { attachedDeposit: NEAR.from("1").toJSON() }
    );
  } catch (e) {
    t.assert(
      e
        .toString()
        .indexOf(
          "Smart contract panicked: assertion failed: The account doesn't have enough balance"
        ) >= 0
    );
  }
});

test("Cross contract transfer", async (t) => {
  const { xcc, ft, root } = t.context.accounts;
  await xcc.call(
    ft,
    "storage_deposit",
    { account_id: xcc.accountId },
    { attachedDeposit: NEAR.parse("1 N").toJSON() }
  );
  await root.call(
    ft,
    "ft_transfer_call",
    { receiver_id: xcc.accountId, amount: "900", memo: null, msg: "test msg" },
    { gas: 200000000000000, attachedDeposit: NEAR.from("1").toJSON() }
  );
  const xccBalance = await ft.view("ft_balance_of", {
    account_id: xcc.accountId,
  });
  t.is(xccBalance, "900");
  const aliSubContractData = await xcc.view("get_contract_data");
  t.is(
    aliSubContractData,
    `[900 from ${root.accountId} to ${xcc.accountId}] test msg `
  );
  const ownerBalance = await ft.view("ft_balance_of", {
    account_id: root.accountId,
  });
  t.is(ownerBalance, "100");
});
