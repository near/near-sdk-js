import { NearBindgen, call, near } from "near-sdk-js";

@NearBindgen({})
export class ExpensiveCalc {
  @call({})
  expensive({ n }) {
    let ret = 0;
    let sign = 1;
    for (let i = 0; i < n; i++) {
        ret += i * sign;
        sign *= -1;
    }
    near.valueReturn(ret.toString())
  }
}
