import { NEAR, Worker } from "near-workspaces";
import test from "ava";

const INITIAL_BALANCE = NEAR.parse("10000 N");
const ONE_YOCTO = 1;
const STOARAGE_BYTE_COST = 10_000_000_000_000_000_000n;
const ACCOUNT_STORAGE_BALANCE = STOARAGE_BYTE_COST * 138n;

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
    t.is(BigInt(res), INITIAL_BALANCE.toBigInt());
});

test("test_storage_deposit", async (t) => {
    const { ftContract, root } = t.context.accounts;
    const bob = await root.createSubAccount("bob", { initialBalance: NEAR.parse("10 N").toJSON() });
    registerUser(ftContract, bob.accountId);
    const bobStorageBalance = await ftContract.view("storage_balance_of", { account_id: bob.accountId });
    t.is(bobStorageBalance, ACCOUNT_STORAGE_BALANCE);
});

test("test_simple_transfer", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("100 N");

    const { ftContract, alice } = t.context.accounts;

    await ftContract.call(
        ftContract,
        "ft_transfer",
        {
            reciever_id: alice.accountId,
            amount: TRANSFER_AMOUNT,
            memo: null
        },
        {
            attachedDeposit: ONE_YOCTO
        }
    );

    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });

    let alice_balance = await ftContract.view("ft_balance_of", { account_id: allice.accountId });

    t.is(INITIAL_BALANCE - TRANSFER_AMOUNT, root_balance);
    t.is(TRANSFER_AMOUNT, alice_balance);
});

test("test_close_account_empty_balance", async (t) => {
    const { ftContract, alice } = t.context.accounts;

    let res = await alice.call(ftContract.id(), "storage_unregister", {}, { attachedDeposit: ONE_YOCTO });
    t.is(res, true); // TODO: doublecheck
});

test("test_close_account_non_empty_balance", async (t) => {
    const { ftContract } = t.context.accounts;

    let res = await ftContract.call("storage_unregister", {}, { attachedDeposit: ONE_YOCTO });
    t.is(res.contains("Can't unregister the account with the positive balance without force"));

    let res2 = await ftContract.call("storage_unregister", { force: false }, { attachedDeposit: ONE_YOCTO });
    t.is(res2.contains("Can't unregister the account with the positive balance without force"));
});

test("simulate_close_account_force_non_empty_balance", async (t) => {
    const { ftContract } = t.context.accounts;

    await ftContract.call("storage_unregister", { force: true }, { attachedDeposit: ONE_YOCTO });

    const res = await ftContract.view("ft_total_supply", {});
    t.is(res, 0);
});

test("simulate_transfer_call_with_burned_amount", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("100 N");

    const { ftContract, defiContract } = t.context.accounts;

    // defi contract must be registered as a FT account
    await registerUser(ftContract, defiContract.accountId);

    // // root invests in defi by calling `ft_transfer_call`
    // let res = ftContract
    //     .batch()
    //     .call(
    //         Function::new("ft_transfer_call")
    //             .args_json((defiContract.id(), TRANSFER_AMOUNT, Option::<String>::None, "10"))
    //             .deposit(ONE_YOCTO)
    //             .gas(300_000_000_000_000 / 2)
    //     )
    //     .call(
    //         Function::new("storage_unregister")
    //             .args_json((Some(true),))
    //             .deposit(ONE_YOCTO)
    //             .gas(300_000_000_000_000 / 2)
    //     )

    // let logs = res.logs();
    // let expected = format!("Account @{} burned {}", ftContract.id(), 10);
    // assert!(logs.len() >= 2);
    // assert!(logs.contains(&"The account of the sender was deleted"));
    // assert!(logs.contains(&(expected.as_str())));

    // // TODO: replace the following manual value extraction when workspaces
    // // resolves https://github.com/near/workspaces-rs/issues/201
    // match res.receipt_outcomes()[5].clone().into_result()? {
    //     ValueOrReceiptId::Value(val) => {
    //         let bytes = base64::decode(&val)?;
    //         let used_amount = serde_json::from_slice::<U128>(&bytes)?;
    //         assert_eq!(used_amount, TRANSFER_AMOUNT);
    //     }
    //     _ => panic!("Unexpected receipt id"),
    // }
    // assert!(res.json::<bool>()?);

    const res = await ftContract.view("ft_total_supply", {});

    t.is(res, TRANSFER_AMOUNT - 10);

    const defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });

    t.is(defi_balance, TRANSFER_AMOUNT);
});

test("simulate_transfer_call_with_immediate_return_and_no_refund", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("100 N");

    const { ftContract, defiContract } = t.context.accounts;

    // defi ftContract must be registered as a FT account
    await registerUser(ftContract, defiContract.accountId);

    // root invests in defi by calling `ft_transfer_call`
    await ftContract.call("ft_transfer_call", {
        receiver_id: defiContract.accountId,
        amount: TRANSFER_AMOUNT,
        memo: null,
        msg: "take-my-money"
    }, { attachedDeposit: ONE_YOCTO });

    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });
    let defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });

    t.is(INITIAL_BALANCE - TRANSFER_AMOUNT, root_balance);
    t.is(TRANSFER_AMOUNT, defi_balance);
});

test("simulate_transfer_call_when_called_contract_not_registered_with_ft", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("100 N");

    const { ftContract, defiContract } = t.context.accounts;

    // call fails because DEFI contract is not registered as FT user
    let res = await ftContract.call("ft_transfer_call", {
        receiver_id: defiContract.accountId,
        amount: TRANSFER_AMOUNT,
        memo: null,
        msg: "take-my-money"
    }, { attachedDeposit: ONE_YOCTO });

    // assert!(res.is_failure()); // TODO

    // balances remain unchanged
    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });
    let defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });

    t.is(initial_balance, root_balance);
    t.is(0, defi_balance);
});

test("simulate_transfer_call_with_promise_and_refund", async (t) => {
    const REFUND_AMOUNT = NEAR.parse("50 N");

    const TRANSFER_AMOUNT = NEAR.parse("100 N");

    const { ftContract, defiContract } = t.context.accounts;

    // defi contract must be registered as a FT account
    await registerUser(ftContract, defiContract.accountId);

    await ftContract.call("ft_transfer_call", {
        receiver_id: defiContract.accountId,
        amount: TRANSFER_AMOUNT,
        memo: null,
        msg: refund_amount,
    }, {
        attachedDeposit: ONE_YOCTO
    });

    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });
    let defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });


    t.is(INITIAL_BALANCE - TRANSFER_AMOUNT + REFUND_AMOUNT, root_balance);
    t.is(TRANSFER_AMOUNT - refund_amount, defi_balance);
});

test("simulate_transfer_call_promise_panics_for_a_full_refund", async (t) => {
    const TRANSFER_AMOUNT = NEAR.parse("100 N");

    const { ftContract, defiContract } = t.context.accounts;

    // defi contract must be registered as a FT account
    await registerUser(ftContract, defiContract.accountId);

    // root invests in defi by calling `ft_transfer_call`
    const res = ftContract.call("ft_transfer_call", {
        receiver_id: defiContract.accountId,
        amount: TRANSFER_AMOUNT,
        memo: null,
        msg: "no parsey as integer big panic oh no",
    }, {
        attachedDeposit: ONE_YOCTO
    });

    //TODO
    // let promise_failures = res.receipt_failures();
    // assert_eq!(promise_failures.len(), 1);
    // let failure = promise_failures[0].clone().into_result();
    // if let Err(err) = failure {
    //     assert!(err.to_string().contains("ParseIntError"));
    // } else {
    //     unreachable!();
    // }

    // balances remain unchanged
    let root_balance = await ftContract.view("ft_balance_of", { account_id: ftContract.accountId });
    let defi_balance = await ftContract.view("ft_balance_of", { account_id: defiContract.accountId });

    t.is(INITIAL_BALANCE, root_balance);
    t.is(0, defi_balance);
});
