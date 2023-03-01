import { NearBindgen, near, call, view, initialize } from "near-sdk-js";

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

  // functions with `ignore_state` are usually used for state migration
  @initialize({ignore_state: true})
  migrate(): void {
    near.log("Count: " + this.count);
  }
}
