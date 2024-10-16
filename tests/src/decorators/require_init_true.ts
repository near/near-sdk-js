import { near, NearBindgen, call, view, initialize } from "near-sdk-js";

/**
 * Simple class used for testing of the `NearBindgen` decorator with `option.requireInit`,
 * which identifies whether the contract requires initialization or not.
 *  - `option.requireInit` set to `true` - Contract requires initialization.
 * - Includes methods:
 *  - `init()` - used for initializing the class
 *  - `getStatus()` - used to get the current status param
 *  - `setStatus()` - used to change the current status
 * @param status - Simple string used for testing.
 */
@NearBindgen({ requireInit: true })
export class NBTest {
  status: string;

  constructor() {
    this.status = "";
  }

  @initialize({})
  init({ status }: { status: string }): void {
    near.log(`init: ${status}`);
    this.status = status;
  }

  @view({})
  getStatus(): string {
    near.log(`getStatus: ${this.status}`);
    return this.status;
  }

  @call({})
  setStatus({ status }: { status: string }): void {
    near.log(`setStatus: ${status}`);
    this.status = status;
  }
}
