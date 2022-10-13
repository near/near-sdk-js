import { Worker } from "near-workspaces";
import test from "ava";

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the test contract.
  const mathApiContract = await root.devDeploy("build/math_api.wasm");

  // Test users
  const ali = await root.createSubAccount("ali");

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, mathApiContract, ali };
});

test.after.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("sha256", async (t) => {
  const { ali, mathApiContract } = t.context.accounts;
  let r = await ali.callRaw(mathApiContract, "test_sha256", "");
  t.deepEqual(
    Buffer.from(r.result.status.SuccessValue, "base64"),
    Buffer.from([
      18, 176, 115, 156, 45, 100, 241, 132, 180, 134, 77, 42, 105, 111, 199,
      127, 118, 112, 92, 255, 88, 43, 83, 147, 122, 55, 26, 36, 42, 156, 160,
      158,
    ])
  );
});

test("keccak256", async (t) => {
  const { ali, mathApiContract } = t.context.accounts;
  let r = await ali.callRaw(mathApiContract, "test_keccak256", "");
  t.deepEqual(
    Buffer.from(r.result.status.SuccessValue, "base64"),
    Buffer.from([
      104, 110, 58, 122, 230, 181, 215, 145, 231, 229, 49, 162, 123, 167, 177,
      58, 26, 142, 129, 173, 7, 37, 9, 26, 233, 115, 64, 102, 61, 85, 10, 159,
    ])
  );
});

test("keccak512", async (t) => {
  const { ali, mathApiContract } = t.context.accounts;
  let r = await ali.callRaw(mathApiContract, "test_keccak512", "");
  t.deepEqual(
    Buffer.from(r.result.status.SuccessValue, "base64"),
    Buffer.from([
      55, 134, 96, 137, 168, 122, 187, 95, 67, 76, 18, 122, 146, 11, 225, 106,
      117, 194, 154, 157, 48, 160, 90, 146, 104, 209, 118, 126, 222, 230, 200,
      125, 48, 73, 197, 236, 123, 173, 192, 197, 90, 153, 167, 121, 100, 88,
      209, 240, 137, 86, 239, 41, 87, 128, 219, 249, 136, 203, 220, 109, 46,
      168, 234, 190,
    ])
  );
});

test("ripemd160", async (t) => {
  const { ali, mathApiContract } = t.context.accounts;
  let r = await ali.callRaw(mathApiContract, "test_ripemd160", "");
  t.deepEqual(
    Buffer.from(r.result.status.SuccessValue, "base64"),
    Buffer.from([
      21, 102, 156, 115, 232, 3, 58, 215, 35, 84, 129, 30, 143, 86, 212, 104,
      70, 97, 14, 225,
    ])
  );
});

test("ecrecover", async (t) => {
  const { ali, mathApiContract } = t.context.accounts;
  let r = await ali.callRaw(mathApiContract, "test_ecrecover", "");
  t.deepEqual(
    Buffer.from(r.result.status.SuccessValue, "base64"),
    Buffer.from([
      227, 45, 244, 40, 101, 233, 113, 53, 172, 251, 101, 243, 186, 231, 27,
      220, 134, 244, 212, 145, 80, 173, 106, 68, 11, 111, 21, 135, 129, 9, 136,
      10, 10, 43, 38, 103, 247, 231, 37, 206, 234, 112, 198, 115, 9, 59, 246,
      118, 99, 224, 49, 38, 35, 200, 224, 145, 177, 60, 242, 192, 241, 30, 246,
      82,
    ])
  );
});

// As of Jun 24, 2022, near-sandbox is using 97c0410de519ecaca369aaee26f0ca5eb9e7de06, in which alt_bn256 is still
// under nightly protocol feature. As near-sandbox is built without nightly protocol feature, alt_bn256 operations
// cannot be tested yet
