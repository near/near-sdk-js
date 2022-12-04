import { near, call } from "near-sdk-js";
import { Counter } from "./counter";

export class CounterWithReset extends Counter {
    @call({})
    reset() {
        this.count = 0;
        near.log(`Counter is set to 0`);
    }
}