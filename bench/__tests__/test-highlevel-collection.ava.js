import { Worker } from "near-workspaces";
import test from "ava";
import {logGasDetail} from "./util.js";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the test contract.
  const highlevelContract = await root.devDeploy("build/highlevel-collection.wasm");
  const highlevelContractRs = await root.devDeploy("res/highlevel_collection.wasm");

  // Test users
  const ali = await root.createSubAccount("ali");
  const bob = await root.createSubAccount("bob");
  const carl = await root.createSubAccount("carl");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, highlevelContract, highlevelContractRs, ali, bob, carl };
});


test("JS highlevel minimal contract", async (t) => {
    const { bob, highlevelContract } = t.context.accounts;
    let r = await bob.callRaw(
        highlevelContract,
        "set",
        JSON.stringify({key: 'a'.repeat(100), value: 'b'.repeat(100)})
    );
    r = await bob.callRaw(
      highlevelContract,
      "set",
      JSON.stringify({key: 'b'.repeat(100), value: 'c'.repeat(100)})
    );
    r = await bob.callRaw(
      highlevelContract,
      "set",
      JSON.stringify({key: 'c'.repeat(100), value: 'd'.repeat(100)})
  );
    

    t.is(r.result.status.SuccessValue, "");
    logGasDetail(r, t)
});

test("RS highlevel minimal contract", async (t) => {
  const { bob, highlevelContractRs } = t.context.accounts;
  let r = await bob.callRaw(
      highlevelContractRs,
      "set",
      JSON.stringify({key: 'a'.repeat(100), value: 'b'.repeat(100)})
  );
  r = await bob.callRaw(
    highlevelContractRs,
    "set",
    JSON.stringify({key: 'b'.repeat(100), value: 'c'.repeat(100)})
  );
  r = await bob.callRaw(
    highlevelContractRs,
    "set",
    JSON.stringify({key: 'c'.repeat(100), value: 'd'.repeat(100)})
);

  t.is(r.result.status.SuccessValue, "");
  logGasDetail(r, t)
});
  