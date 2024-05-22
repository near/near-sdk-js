import { Worker } from "near-workspaces";
import test from "ava";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the test contract.
  const altBn128ApiContract = await root.devDeploy("build/alt_bn128_api.wasm");

  // Test users
  const ali = await root.createSubAccount("ali");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, altBn128ApiContract, ali };
});

test.after.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("test_alt_bn128_g1_sum", async (t) => {
  const { ali, altBn128ApiContract } = t.context.accounts;
  let r = await ali.callRaw(altBn128ApiContract, "test_alt_bn128_g1_sum", "");
  t.deepEqual(
    Buffer.from(r.result.status.SuccessValue, "base64"),
    Buffer.from([
      11, 49, 94, 29, 152, 111, 116, 138, 248, 2, 184, 8, 159, 80, 169, 45, 149,
      48, 32, 49, 37, 6, 133, 105, 171, 194, 120, 44, 195, 17, 180, 35, 137,
      154, 4, 192, 211, 244, 93, 200, 2, 44, 0, 64, 26, 108, 139, 147, 88, 235,
      242, 23, 253, 52, 110, 236, 67, 99, 176, 2, 186, 198, 228, 25,
    ])
  );
});

test("test_alt_bn128_g1_multiexp", async (t) => {
  const { ali, altBn128ApiContract } = t.context.accounts;
  let r = await ali.callRaw(
    altBn128ApiContract,
    "test_alt_bn128_g1_multiexp",
    ""
  );
  t.deepEqual(
    Buffer.from(r.result.status.SuccessValue, "base64"),
    Buffer.from([
      150, 94, 159, 52, 239, 226, 181, 150, 77, 86, 90, 186, 102, 219, 243, 204,
      36, 128, 164, 209, 106, 6, 62, 124, 235, 104, 223, 195, 30, 204, 42, 20,
      13, 158, 14, 197, 133, 73, 43, 171, 28, 68, 82, 116, 244, 164, 36, 251,
      244, 8, 234, 40, 118, 55, 216, 187, 242, 39, 213, 160, 192, 184, 28, 23,
    ])
  );
});

test("test_alt_bn128_pairing_check", async (t) => {
  const { ali, altBn128ApiContract } = t.context.accounts;
  let r = await ali.call(
    altBn128ApiContract,
    "test_alt_bn128_pairing_check_valid",
    {}
  );
  t.is(r, true);

  r = await ali.call(
    altBn128ApiContract,
    "test_alt_bn128_pairing_check_invalid",
    {}
  );
  t.is(r, false);
});
