import { Worker } from "near-workspaces";
import test from "ava";
import {
  formatGas,
  gasBreakdown,
  logGasBreakdown,
  logGasDetail,
} from "./util.js";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the test contract.
  const callerContract = await root.createSubAccount("caller", {
    initialBalance: "1000N",
  });
  await callerContract.deploy("build/deploy-contract.wasm");

  const callerContractRs = await root.createSubAccount("callrs", {
    initialBalance: "1000N",
  });
  await callerContractRs.deploy("res/deploy_contract.wasm");
  // Test users
  const ali = await root.createSubAccount("ali");
  const bob = await root.createSubAccount("bob");
  const carl = await root.createSubAccount("carl");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = {
    root,
    callerContract,
    ali,
    bob,
    carl,
    callerContractRs,
  };
});

test("JS promise batch deploy contract and call", async (t) => {
  const { bob, callerContract } = t.context.accounts;

  let r = await bob.callRaw(callerContract, "deploy_contract", "", {
    gas: "300 Tgas",
  });
  // console.log(JSON.stringify(r, null, 2));
  let deployed = callerContract.getSubAccount("a");
  t.deepEqual(JSON.parse(Buffer.from(r.result.status.SuccessValue, "base64")), {
    currentAccountId: deployed.accountId,
    signerAccountId: bob.accountId,
    predecessorAccountId: callerContract.accountId,
    input: "abc",
  });

  t.log(
    "Gas used to convert transaction to receipt: ",
    formatGas(r.result.transaction_outcome.outcome.gas_burnt)
  );
  t.log(
    "Gas used to execute the receipt (actual contract call): ",
    formatGas(r.result.receipts_outcome[0].outcome.gas_burnt)
  );
  let map = gasBreakdown(r.result.receipts_outcome[0].outcome);
  logGasBreakdown(map, t);
  t.log(
    "Gas used to execute the cross contract call: ",
    formatGas(r.result.receipts_outcome[1].outcome.gas_burnt)
  );
  map = gasBreakdown(r.result.receipts_outcome[1].outcome);
  logGasBreakdown(map, t);
  t.log(
    "Gas used to refund unused gas for cross contract call: ",
    formatGas(r.result.receipts_outcome[2].outcome.gas_burnt)
  );
  t.log(
    "Gas used to refund unused gas: ",
    formatGas(r.result.receipts_outcome[3].outcome.gas_burnt)
  );
  t.log(
    "Total gas used: ",
    formatGas(
      r.result.transaction_outcome.outcome.gas_burnt +
        r.result.receipts_outcome[0].outcome.gas_burnt +
        r.result.receipts_outcome[1].outcome.gas_burnt +
        r.result.receipts_outcome[2].outcome.gas_burnt +
        r.result.receipts_outcome[3].outcome.gas_burnt
    )
  );
});

test("RS promise batch deploy contract and call", async (t) => {
  const { bob, callerContractRs } = t.context.accounts;

  let r = await bob.callRaw(callerContractRs, "deploy_contract", "", {
    gas: "300 Tgas",
  });
  // console.log(JSON.stringify(r, null, 2));
  let deployed = callerContractRs.getSubAccount("a");
  t.deepEqual(JSON.parse(Buffer.from(r.result.status.SuccessValue, "base64")), {
    currentAccountId: deployed.accountId,
    signerAccountId: bob.accountId,
    predecessorAccountId: callerContractRs.accountId,
    input: "abc",
  });

  t.log(
    "Gas used to convert transaction to receipt: ",
    formatGas(r.result.transaction_outcome.outcome.gas_burnt)
  );
  t.log(
    "Gas used to execute the receipt (actual contract call): ",
    formatGas(r.result.receipts_outcome[0].outcome.gas_burnt)
  );
  let map = gasBreakdown(r.result.receipts_outcome[0].outcome);
  logGasBreakdown(map, t);
  t.log(
    "Gas used to execute the cross contract call: ",
    formatGas(r.result.receipts_outcome[1].outcome.gas_burnt)
  );
  map = gasBreakdown(r.result.receipts_outcome[1].outcome);
  logGasBreakdown(map, t);
  t.log(
    "Gas used to refund unused gas for cross contract call: ",
    formatGas(r.result.receipts_outcome[2].outcome.gas_burnt)
  );
  t.log(
    "Gas used to refund unused gas: ",
    formatGas(r.result.receipts_outcome[3].outcome.gas_burnt)
  );
  t.log(
    "Total gas used: ",
    formatGas(
      r.result.transaction_outcome.outcome.gas_burnt +
        r.result.receipts_outcome[0].outcome.gas_burnt +
        r.result.receipts_outcome[1].outcome.gas_burnt +
        r.result.receipts_outcome[2].outcome.gas_burnt +
        r.result.receipts_outcome[3].outcome.gas_burnt
    )
  );
});
