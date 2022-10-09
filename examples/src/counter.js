import { NearBindgen, near, call, view } from "near-sdk-js";
import { isUndefined } from "lodash-es";

@NearBindgen({})
export class Counter {
  constructor() {
    this.count = 0;
  }

  @call({})
  increase({ n = 1 }) {
    this.count += n;
    near.log(`Counter increased to ${this.count}`);
  }

  @call({})
  decrease({ n }) {
    // you can use default argument `n=1` too
    // this is to illustrate a npm dependency: lodash can be used
    if (isUndefined(n)) {
      this.count -= 1;
    } else {
      this.count -= n;
    }
    near.log(`Counter decreased to ${this.count}`);
  }

  @view({})
  getCount() {
    return this.count;
  }
}
