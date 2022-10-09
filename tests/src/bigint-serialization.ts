import { near, NearBindgen, call, view } from "near-sdk-js";

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
