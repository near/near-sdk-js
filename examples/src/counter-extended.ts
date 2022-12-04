import { near, NearBindgen, call } from "near-sdk-js";
import { Counter } from "./counter";

@NearBindgen({})
export class CounterWithReset extends Counter {
    @call({})
    reset() {
        this.count = 0;
        near.log(`Counter is set to 0`);
    }
}