import { near, NearBindgen, call, view } from "near-sdk-js";

/**
 * Simple class used for testing of the `@call` decorator method with `option.payableFunction`,
 * which identifies whether the function can accept an attached deposit.
 *  - `option.payableFunction` set to `true`
 *  - `option.payableFunction` set to `false`
 * - Includes methods:
 *  - `setValueWithPayableFunction({ value })` - used to change the current value and can accept an attached deposit.
 *  - `setValueWithNotPayableFunction({ value })` - used to change the current value and cannot accept an attached deposit.
 *  - `setValueWithNotPayableFunctionByDefault({ value })` - used to change the current value and cannot accept an attached deposit,
 * default behavior.
 *  - `getValue()` - returns the current value
 * @param value - Simple string used for testing.
 */
@NearBindgen({})
export class PayableTest {
  value: string;

  constructor() {
    this.value = "";
  }

  @call({ payableFunction: true })
  setValueWithPayableFunction({ value }: { value: string }): void {
    near.log(`payableFunction: ${value}`);
    this.value = value;
  }

  @call({ payableFunction: false })
  setValueWithNotPayableFunction({ value }: { value: string }): void {
    near.log(`notPayableFunction: ${value}`);
    this.value = value;
  }

  @call({})
  setValueWithNotPayableFunctionByDefault({ value }: { value: string }): void {
    near.log(`notPayableFunctionDefault: ${value}`);
    this.value = value;
  }

  @view({})
  getValue(): string {
    return this.value;
  }
}
