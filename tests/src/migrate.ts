import { NearBindgen, near, call, view, migrate } from "near-sdk-js";

/**
 * Simple class used for testing.
 *  - `option.requireInit` set to `true` - Contract requires initialization.
 * - Includes methods:
 *  - `increase({ n })` - increases the count with the given `n`
 *  - `getCount()` - get the current count
 *  - `migrFuncValueTo18()` - set the current count to `18`
 * @param count - Simple number used for testing.
 */
@NearBindgen({})
export class Counter {
  count = 0;

  @call({})
  increase({ n = 1 }: { n: number }) {
    this.count += n;
    near.log(`Counter increased to ${this.count}`);
  }

  @view({})
  getCount(): number {
    return this.count;
  }

  @migrate({})
  migrFuncValueTo18(): void {
    near.log("Count: " + this.count); // expected to be 0
    this.count = 18;
  }
}
