import { NEAR, Worker } from "near-workspaces";
import test from "ava";

const INITIAL_BALANCE = NEAR.parse("10000 N").toJSON();
const ONE_YOCTO = 1; // TODO: why ONE_YOCTO must be a number, while other arguments can be strings?
const STOARAGE_BYTE_COST = 10_000_000_000_000_000_000n;
const ACCOUNT_STORAGE_BALANCE = String(STOARAGE_BYTE_COST * 138n);

test.beforeEach(async (t) => {
    const worker = await Worker.init();
    const root = worker.rootAccount;

    const ftContract = await root.devDeploy("./build/my-ft.wasm");
    await ftContract.call(
        ftContract,
        "init_with_default_meta",
        {
            owner_id: ftContract.accountId,
            total_supply: INITIAL_BALANCE
        }
    );

    const defiContract = await root.devDeploy("./res/defi.wasm");

    await defiContract.call(
        defiContract,
        "new",
        {
            fungible_token_account_id: ftContract.accountId
        }
    );

    const alice = await root.createSubAccount("alice", { initialBalance: NEAR.parse("10 N").toJSON() });

    await registerUser(ftContract, alice.accountId);

    t.context.worker = worker;
    t.context.accounts = {
        root,
        ftContract,
        alice,
        defiContract,
    };
});

test.afterEach.always(async (t) => {
    await t.context.worker.tearDown().catch((error) => {
        console.log("Failed tear down the worker:", error);
    });
});


async function registerUser(contract, account_id) {
    const deposit = String(ACCOUNT_STORAGE_BALANCE);
    await contract.call(contract, "storage_deposit", { account_id: account_id }, { attachedDeposit: deposit });
}

test("test_total_supply", async (t) => {
    const { ftContract } = t.context.accounts;
    const res = await ftContract.view("ft_total_supply", {});
    t.is(BigInt(res), BigInt(INITIAL_BALANCE));
});

test("test_storage_deposit", async (t) => {
    const { ftContract, root } = t.context.accounts;
    const bob = await root.createSubAccount("bob", { initialBalance: NEAR.parse("10 N").toJSON() });
    await registerUser(ftContract, bob.accountId);
    const bobStorageBalance = await ftContract.view("storage_balance_of", { account_id: bob.accountId });
    t.is(bobStorageBalance.total, String(ACCOUNT_STORAGE_BALANCE));
});

test("test_simple_transfer", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("1000 N");
    const EXPECTED_ROOT_BALANCE = NEAR.parse("9000 N");

    const { ftContract, alice } = t.context.accounts;

    await ftContract.call(
        ftContract,
        "ft_transfer",
        {
            receiver_id: alice.accountId,
            amount: TRANSFER_AMOUNT,
            memo: null
        },
        {
            attachedDeposit: ONE_YOCTO
        }
    );

    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });

    let alice_balance = await ftContract.view("ft_balance_of", { account_id: alice.accountId });

    // TODO: these conversions are too complicated
    t.is(String(EXPECTED_ROOT_BALANCE), root_balance.toLocaleString('fullwide', { useGrouping: false }));
    t.is(String(TRANSFER_AMOUNT), Number(alice_balance).toLocaleString('fullwide', { useGrouping: false }));
});

test("test_close_account_empty_balance", async (t) => {
    const { ftContract, alice } = t.context.accounts;

    let res = await alice.call(ftContract, "storage_unregister", {}, { attachedDeposit: ONE_YOCTO });
    t.is(res, true); // TODO: doublecheck
});

test("test_close_account_non_empty_balance", async (t) => {
    const { ftContract } = t.context.accounts;

    try {
        await ftContract.call(ftContract, "storage_unregister", {}, { attachedDeposit: ONE_YOCTO });
        throw Error("Unreachable string");
    } catch (e) {
        t.is(JSON.stringify(e, Object.getOwnPropertyNames(e)).includes("Can't unregister the account with the positive balance without force"), true);
    }

    try {
        await ftContract.call(ftContract, "storage_unregister", { force: false }, { attachedDeposit: ONE_YOCTO });
        throw Error("Unreachable string");
    } catch (e) {
        t.is(JSON.stringify(e, Object.getOwnPropertyNames(e)).includes("Can't unregister the account with the positive balance without force"), true);
    }
});

test("simulate_close_account_force_non_empty_balance", async (t) => {
    const { ftContract } = t.context.accounts;

    await ftContract.call(
        ftContract,
        "storage_unregister",
        { force: true },
        { attachedDeposit: ONE_YOCTO }
    );

    const res = await ftContract.view("ft_total_supply", {});
    t.is(Number(res), 0);
});

test("simulate_transfer_call_with_burned_amount", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("100 N").toJSON();

    const { ftContract, defiContract } = t.context.accounts;

    // defi contract must be registered as a FT account
    await registerUser(ftContract, defiContract.accountId);

    const result = await ftContract
        .batch(ftContract)
        .functionCall(
            'ft_transfer_call',
            {
                receiver_id: defiContract.accountId,
                amount: TRANSFER_AMOUNT,
                memo: null,
                msg: "10",
            },
            {
                attachedDeposit: '1',
                gas: '150 Tgas'
            },
        )
        .functionCall(
            'storage_unregister',
            {
                force: true
            },
            {
                attachedDeposit: '1',
                gas: '150 Tgas',
            },
        )
        .transact();

    const logs = JSON.stringify(result);
    let expected = `Account @${ftContract.accountId} burned ${10}`;
    t.is(logs.includes("The account of the sender was deleted"), true);
    t.is(logs.includes(expected), true);

    const new_total_supply = await ftContract.view("ft_total_supply", {});

    t.is(BigInt(new_total_supply), BigInt(TRANSFER_AMOUNT) - 10n);

    const defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });

    t.is(BigInt(defi_balance), BigInt(TRANSFER_AMOUNT) - 10n);
});

test("simulate_transfer_call_with_immediate_return_and_no_refund", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("100 N").toJSON();

    const { ftContract, defiContract } = t.context.accounts;

    // defi ftContract must be registered as a FT account
    await registerUser(ftContract, defiContract.accountId);

    // root invests in defi by calling `ft_transfer_call`
    await ftContract.call(
        ftContract,
        "ft_transfer_call",
        {
            receiver_id: defiContract.accountId,
            amount: TRANSFER_AMOUNT,
            memo: null,
            msg: "take-my-money"
        },
        {
            attachedDeposit: ONE_YOCTO,
            gas: 300000000000000,
        }
    );

    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });
    let defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });

    t.is(BigInt(INITIAL_BALANCE) - BigInt(TRANSFER_AMOUNT), BigInt(root_balance));
    t.is(BigInt(TRANSFER_AMOUNT), BigInt(defi_balance));
});

test("simulate_transfer_call_when_called_contract_not_registered_with_ft", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("100 N").toJSON();

    const { ftContract, defiContract } = t.context.accounts;

    // call fails because DEFI contract is not registered as FT user
    try {
        await ftContract.call(
            ftContract,
            "ft_transfer_call",
            {
                receiver_id: defiContract.accountId,
                amount: TRANSFER_AMOUNT,
                memo: null,
                msg: "take-my-money"
            },
            {
                attachedDeposit: ONE_YOCTO,
                gas: 50000000000000n,
            }
        );
        t.is(true, false); // Unreachable
    } catch (e) {
        t.is(JSON.stringify(e, Object.getOwnPropertyNames(e)).includes("is not registered"), true);
    }

    // balances remain unchanged
    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });
    let defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });

    t.is(INITIAL_BALANCE, root_balance);
    t.is(0n, BigInt(defi_balance));
});

test("simulate_transfer_call_with_promise_and_refund", async (t) => {
    const REFUND_AMOUNT = NEAR.parse("50 N").toJSON();
    const TRANSFER_AMOUNT = NEAR.parse("100 N").toJSON();
    const TRANSFER_CALL_GAS = String(300_000_000_000_000n);

    const { ftContract, defiContract } = t.context.accounts;

    // defi contract must be registered as a FT account
    await registerUser(ftContract, defiContract.accountId);

    await ftContract.call(ftContract, "ft_transfer_call", {
        receiver_id: defiContract.accountId,
        amount: TRANSFER_AMOUNT,
        memo: null,
        msg: REFUND_AMOUNT,
    }, {
        attachedDeposit: ONE_YOCTO,
        gas: TRANSFER_CALL_GAS,
    });

    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });
    let defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });

    t.is(BigInt(INITIAL_BALANCE) - BigInt(TRANSFER_AMOUNT) + BigInt(REFUND_AMOUNT), BigInt(root_balance));
    t.is(BigInt(TRANSFER_AMOUNT) - BigInt(REFUND_AMOUNT), BigInt(defi_balance));
});

test("simulate_transfer_call_promise_panics_for_a_full_refund", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("100 N").toJSON();

    const { ftContract, defiContract } = t.context.accounts;

    // defi contract must be registered as a FT account
    await registerUser(ftContract, defiContract.accountId);

    // root invests in defi by calling `ft_transfer_call`
    const res = await ftContract.callRaw(
        ftContract,
        "ft_transfer_call",
        {
            receiver_id: defiContract.accountId,
            amount: TRANSFER_AMOUNT,
            memo: null,
            msg: "no parsey as integer big panic oh no",
        },
        {
            attachedDeposit: ONE_YOCTO,
            gas: 50000000000000n,
        }
    );

    t.is(JSON.stringify(res).includes("ParseIntError"), true);

    // balances remain unchanged
    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });
    let defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });

    t.is(INITIAL_BALANCE, root_balance);
    t.is(0n, BigInt(defi_balance));
});
