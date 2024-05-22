import { NearBindgen, near, call, view, migrate } from "near-sdk-js";

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
