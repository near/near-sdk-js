import { near, NearBindgen, call, view } from "near-sdk-js";

/**
 * Simple class used for testing of the `@call` decorator method with `option.privateFunction`,
 * which identifies whether the function can be called by other contracts.
 *  - `option.privateFunction` set to `true`
 *  - `option.privateFunction` set to `false`
 * - Includes methods:
 *  - `setValueWithPrivateFunction({ value })` - used to change the current value and cannot be called by other contracts.
 *  - `setValueWithNotPrivateFunction({ value })` - used to change the current value and can be called by other contracts.
 *  - `setValueWithNotPrivateFunctionByDefault({ value })` - used to change the current value and can be called by other contracts,
 * default behavior.
 *  - `getValue()` - returns the current value
 * @param value - Simple string used for testing.
 */
@NearBindgen({})
export class PrivateTest {
  value: string;

  constructor() {
    this.value = "";
  }

  @call({ privateFunction: true })
  setValueWithPrivateFunction({ value }: { value: string }): void {
    near.log(`setValueWithPrivateFunction: ${value}`);
    this.value = value;
  }

  @call({ privateFunction: false })
  setValueWithNotPrivateFunction({ value }: { value: string }): void {
    near.log(`setValueWithNotPrivateFunction: ${value}`);
    this.value = value;
  }

  @call({})
  setValueWithNotPrivateFunctionByDefault({ value }: { value: string }): void {
    near.log(`setValueWithNotPrivateFunctionByDefault: ${value}`);
    this.value = value;
  }

  @view({})
  getValue(): string {
    return this.value;
  }
}
