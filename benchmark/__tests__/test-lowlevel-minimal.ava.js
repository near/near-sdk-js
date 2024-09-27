import { Worker } from "near-workspaces";
import test from "ava";
import { logGasDetail } from "./util.js";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the test contract.
  const lowlevelContract = await root.devDeploy("build/lowlevel-minimal.wasm");
  const lowlevelContractRs = await root.devDeploy("res/lowlevel_minimal.wasm");

  // Test users
  const ali = await root.createSubAccount("ali");
  const bob = await root.createSubAccount("bob");
  const carl = await root.createSubAccount("carl");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = {
    root,
    lowlevelContract,
    lowlevelContractRs,
    ali,
    bob,
    carl,
  };
});

test("JS lowlevel minimal contract", async (t) => {
  const { bob, lowlevelContract } = t.context.accounts;
  let r = await bob.callRaw(lowlevelContract, "empty", "");

  t.is(r.result.status.SuccessValue, "");
  logGasDetail(r, t);
});

test("RS lowlevel minimal contract", async (t) => {
  const { bob, lowlevelContractRs } = t.context.accounts;
  let r = await bob.callRaw(lowlevelContractRs, "empty", "");
  
  t.is(r.result.status.SuccessValue, "");
  logGasDetail(r, t);
});
