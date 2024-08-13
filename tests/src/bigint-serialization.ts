import { near, NearBindgen, call, view } from "near-sdk-js";

/**
 * Simple class used for testing of the `bigintField`.
 * - Includes methods:
 *  - `getBigintField()` - returns the current `bigintField` value.
 *  - `setBigintField(args: { bigintField })` - used to change the current `bigintField` value.
 *  - `increment()` - increases the `bigintField` value by `1n`.
 * @param bigintField - Simple bigint used for testing.
 */
@NearBindgen({})
export class BigIntSerializationTest {
  bigintField: bigint;

  constructor() {
    this.bigintField = 1n;
  }

  @view({})
  getBigintField(): bigint {
    near.log(`getBigintField: ${this.bigintField}`);
    return this.bigintField;
  }

  @call({})
  setBigintField(args: { bigintField: bigint }): void {
    const bigintField = BigInt(args.bigintField);
    near.log(`setBigintField: ${bigintField}`);
    this.bigintField = bigintField;
  }

  @call({})
  increment(): void {
    this.bigintField += 1n;
    near.log(`increment: ${this.bigintField}`);
  }
}
