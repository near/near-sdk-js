import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
    const worker = await Worker.init();
    const root = worker.rootAccount;

    const ftContract = await root.devDeploy("./build/my-ft.wasm");
    await ftContract.call(ftContract, "new_default_meta", {});

    const defiContract = root.devDeploy("./build/defi.wasm");
    await defiContract.call("new", { fungible_token_account_id: ftContract.accountId })

    const alice = await root.createSubAccount("alice", { initialBalance: 10 });


    await ftReceiver.call(ftReceiver, "init", {
        non_fungible_token_account_id: ftContract.accountId,
    });

    await ftContract.call("storage_deposit", { account_id: alice.accountId, registration_only: null }, { attachedDeposit: near_sdk:: env:: storage_byte_cost() * 125 });

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


async function registerUser(contract: Contract, account_id: AccountId) {
    // let res = contract
    //     .call("storage_deposit")
    //     .args_json((account_id, Option::<bool>::None))
    //     .max_gas()
    //     .deposit(near_sdk::env::storage_byte_cost() * 125)
    //     .transact()
    //     .await?;
    // assert!(res.is_success());
}

test("test_total_supply", async () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, _, _) = init(&worker, initial_balance).await?;

    // let res = contract.call("ft_total_supply").view().await?;
    // assert_eq!(res.json::<U128>()?, initial_balance);

    // Ok(())
});

test("test_simple_transfer", async () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let transfer_amount = U128::from(parse_near!("100 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, alice, _) = init(&worker, initial_balance).await?;

    // let res = contract
    //     .call("ft_transfer")
    //     .args_json((alice.id(), transfer_amount, Option::<bool>::None))
    //     .max_gas()
    //     .deposit(ONE_YOCTO)
    //     .transact()
    //     .await?;
    // assert!(res.is_success());

    // let root_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // let alice_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((alice.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // assert_eq!(initial_balance.0 - transfer_amount.0, root_balance.0);
    // assert_eq!(transfer_amount.0, alice_balance.0);

    // Ok(())
});

test("test_close_account_empty_balance", async () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, alice, _) = init(&worker, initial_balance).await?;

    // let res = alice
    //     .call(contract.id(), "storage_unregister")
    //     .args_json((Option::<bool>::None,))
    //     .max_gas()
    //     .deposit(ONE_YOCTO)
    //     .transact()
    //     .await?;
    // assert!(res.json::<bool>()?);

    // Ok(())
});

test("test_close_account_non_empty_balance", async () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, _, _) = init(&worker, initial_balance).await?;

    // let res = contract
    //     .call("storage_unregister")
    //     .args_json((Option::<bool>::None,))
    //     .max_gas()
    //     .deposit(ONE_YOCTO)
    //     .transact()
    //     .await;
    // assert!(format!("{:?}", res)
    //     .contains("Can't unregister the account with the positive balance without force"));

    // let res = contract
    //     .call("storage_unregister")
    //     .args_json((Some(false),))
    //     .max_gas()
    //     .deposit(ONE_YOCTO)
    //     .transact()
    //     .await;
    // assert!(format!("{:?}", res)
    //     .contains("Can't unregister the account with the positive balance without force"));

    // Ok(())
});

test("simulate_close_account_force_non_empty_balance", () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, _, _) = init(&worker, initial_balance).await?;

    // let res = contract
    //     .call("storage_unregister")
    //     .args_json((Some(true),))
    //     .max_gas()
    //     .deposit(ONE_YOCTO)
    //     .transact()
    //     .await?;
    // assert!(res.is_success());

    // let res = contract.call("ft_total_supply").view().await?;
    // assert_eq!(res.json::<U128>()?.0, 0);

    // Ok(())
});

test("simulate_transfer_call_with_burned_amount", async () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let transfer_amount = U128::from(parse_near!("100 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, _, defi_contract) = init(&worker, initial_balance).await?;

    // // defi contract must be registered as a FT account
    // registerUser(&contract, defi_contract.id()).await?;

    // // root invests in defi by calling `ft_transfer_call`
    // let res = contract
    //     .batch()
    //     .call(
    //         Function::new("ft_transfer_call")
    //             .args_json((defi_contract.id(), transfer_amount, Option::<String>::None, "10"))
    //             .deposit(ONE_YOCTO)
    //             .gas(300_000_000_000_000 / 2)
    //     )
    //     .call(
    //         Function::new("storage_unregister")
    //             .args_json((Some(true),))
    //             .deposit(ONE_YOCTO)
    //             .gas(300_000_000_000_000 / 2)
    //     )
    //     .transact()
    //     .await?;
    // assert!(res.is_success());

    // let logs = res.logs();
    // let expected = format!("Account @{} burned {}", contract.id(), 10);
    // assert!(logs.len() >= 2);
    // assert!(logs.contains(&"The account of the sender was deleted"));
    // assert!(logs.contains(&(expected.as_str())));

    // // TODO: replace the following manual value extraction when workspaces
    // // resolves https://github.com/near/workspaces-rs/issues/201
    // match res.receipt_outcomes()[5].clone().into_result()? {
    //     ValueOrReceiptId::Value(val) => {
    //         let bytes = base64::decode(&val)?;
    //         let used_amount = serde_json::from_slice::<U128>(&bytes)?;
    //         assert_eq!(used_amount, transfer_amount);
    //     }
    //     _ => panic!("Unexpected receipt id"),
    // }
    // assert!(res.json::<bool>()?);

    // let res = contract.call("ft_total_supply").view().await?;
    // assert_eq!(res.json::<U128>()?.0, transfer_amount.0 - 10);
    // let defi_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((defi_contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // assert_eq!(defi_balance.0, transfer_amount.0 - 10);

    // Ok(())
});

test("simulate_transfer_call_with_immediate_return_and_no_refund", () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let transfer_amount = U128::from(parse_near!("100 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, _, defi_contract) = init(&worker, initial_balance).await?;

    // // defi contract must be registered as a FT account
    // registerUser(&contract, defi_contract.id()).await?;

    // // root invests in defi by calling `ft_transfer_call`
    // let res = contract
    //     .call("ft_transfer_call")
    //     .args_json((defi_contract.id(), transfer_amount, Option::<String>::None, "take-my-money"))
    //     .max_gas()
    //     .deposit(ONE_YOCTO)
    //     .transact()
    //     .await?;
    // assert!(res.is_success());

    // let root_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // let defi_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((defi_contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // assert_eq!(initial_balance.0 - transfer_amount.0, root_balance.0);
    // assert_eq!(transfer_amount.0, defi_balance.0);

    // Ok(())
});

test("simulate_transfer_call_when_called_contract_not_registered_with_ft", async () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let transfer_amount = U128::from(parse_near!("100 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, _, defi_contract) = init(&worker, initial_balance).await?;

    // // call fails because DEFI contract is not registered as FT user
    // let res = contract
    //     .call("ft_transfer_call")
    //     .args_json((defi_contract.id(), transfer_amount, Option::<String>::None, "take-my-money"))
    //     .max_gas()
    //     .deposit(ONE_YOCTO)
    //     .transact()
    //     .await?;
    // assert!(res.is_failure());

    // // balances remain unchanged
    // let root_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // let defi_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((defi_contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // assert_eq!(initial_balance.0, root_balance.0);
    // assert_eq!(0, defi_balance.0);

    // Ok(())
});

test("simulate_transfer_call_with_promise_and_refund", async () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let refund_amount = U128::from(parse_near!("50 N"));
    // let transfer_amount = U128::from(parse_near!("100 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, _, defi_contract) = init(&worker, initial_balance).await?;

    // // defi contract must be registered as a FT account
    // registerUser(&contract, defi_contract.id()).await?;

    // let res = contract
    //     .call("ft_transfer_call")
    //     .args_json((
    //         defi_contract.id(),
    //         transfer_amount,
    //         Option::<String>::None,
    //         refund_amount.0.to_string(),
    //     ))
    //     .max_gas()
    //     .deposit(ONE_YOCTO)
    //     .transact()
    //     .await?;
    // assert!(res.is_success());

    // let root_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // let defi_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((defi_contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // assert_eq!(initial_balance.0 - transfer_amount.0 + refund_amount.0, root_balance.0);
    // assert_eq!(transfer_amount.0 - refund_amount.0, defi_balance.0);

    // Ok(())
});

test("simulate_transfer_call_promise_panics_for_a_full_refund", async () => {
    // let initial_balance = U128::from(parse_near!("10000 N"));
    // let transfer_amount = U128::from(parse_near!("100 N"));
    // let worker = workspaces::sandbox().await?;
    // let (contract, _, defi_contract) = init(&worker, initial_balance).await?;

    // // defi contract must be registered as a FT account
    // registerUser(&contract, defi_contract.id()).await?;

    // // root invests in defi by calling `ft_transfer_call`
    // let res = contract
    //     .call("ft_transfer_call")
    //     .args_json((
    //         defi_contract.id(),
    //         transfer_amount,
    //         Option::<String>::None,
    //         "no parsey as integer big panic oh no".to_string(),
    //     ))
    //     .max_gas()
    //     .deposit(ONE_YOCTO)
    //     .transact()
    //     .await?;
    // assert!(res.is_success());

    // let promise_failures = res.receipt_failures();
    // assert_eq!(promise_failures.len(), 1);
    // let failure = promise_failures[0].clone().into_result();
    // if let Err(err) = failure {
    //     assert!(err.to_string().contains("ParseIntError"));
    // } else {
    //     unreachable!();
    // }

    // // balances remain unchanged
    // let root_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // let defi_balance = contract
    //     .call("ft_balance_of")
    //     .args_json((defi_contract.id(),))
    //     .view()
    //     .await?
    //     .json::<U128>()?;
    // assert_eq!(initial_balance, root_balance);
    // assert_eq!(0, defi_balance.0);

    // Ok(())
});
