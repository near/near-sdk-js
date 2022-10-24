import test from "ava";
import { execSync } from "child_process";

test("should not throw error, constructor is correctly initialized", async (t) => {
  let result = null;
  try {
    result = execSync(
      "near-sdk-js build src/constructor-validation/all-parameters-set-in-constructor.ts build/all-parameters-set-in-constructor.wasm"
    ).toString();
  } catch (e) {
    result = e;
  }
  t.not(result.status, 2);
});

test("should throw error, name is not inited", async (t) => {
  let result = null;
  try {
    result = execSync(
      "near-sdk-js build src/constructor-validation/1-parameter-not-set-in-constructor.ts build/1-parameter-not-set-in-constructor.wasm"
    ).toString();
  } catch (e) {
    result = e;
  }

  t.is(result.status, 2);
});

test("should throw error, construcor is empty", async (t) => {
  let result = null;
  try {
    result = execSync(
      "near-sdk-js build src/constructor-validation/no-parameters-set-in-constructor.ts build/no-parameters-set-in-constructor.wasm"
    ).toString();
  } catch (e) {
    result = e;
  }

  t.is(result.status, 2);
});

test("should throw error, construcor is not declared", async (t) => {
  let result = null;
  try {
    result = execSync(
      "near-sdk-js build src/constructor-validation/no-constructor.ts build/no-constructor.wasm"
    ).toString();
  } catch (e) {
    result = e;
  }
  t.is(result.status, 2);
});
