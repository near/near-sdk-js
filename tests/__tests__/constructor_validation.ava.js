import test from "ava";
import { execSync } from "child_process";

const BUILD_FAILURE_ERROR_CODE = 1;

test("should not throw error, constructor is correctly initialized", async (t) => {
  t.notThrows(() => {
    execSync(
      "near-sdk-js build src/constructor-validation/all-parameters-set-in-constructor.ts build/all-parameters-set-in-constructor.wasm"
    );
  });
});

test("should throw error, name is not inited", async (t) => {
  const error = t.throws(() => {
    execSync(
      "near-sdk-js build src/constructor-validation/1-parameter-not-set-in-constructor.ts build/1-parameter-not-set-in-constructor.wasm"
    );
  });
  t.is(error.status, BUILD_FAILURE_ERROR_CODE);
});

test("should throw error, construcor is empty", async (t) => {
  const error = t.throws(() => {
    execSync(
      "near-sdk-js build src/constructor-validation/no-parameters-set-in-constructor.ts build/no-parameters-set-in-constructor.wasm"
    );
  });
  t.is(error.status, BUILD_FAILURE_ERROR_CODE);
});

test("should throw error, construcor is not declared", async (t) => {
  const error = t.throws(() => {
    execSync(
      "near-sdk-js build src/constructor-validation/no-constructor.ts build/no-constructor.wasm"
    );
  });
  t.is(error.status, BUILD_FAILURE_ERROR_CODE);
});
