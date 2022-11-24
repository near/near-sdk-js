import { call, NearBindgen, NearPromise, view, near } from "near-sdk-js";
import { serialize } from "near-sdk-js/lib/utils";

const CONTRACTS = [
  "first-contract.test.near",
  "second-contract.test.near",
  "third-contract.test.near",
];
const NO_ARGS = "";
const THIRTY_TGAS = BigInt("30" + "0".repeat(12));

@NearBindgen({})
class LoopXCC {
  constructor() {
    this.count = 0;
  }

  @call({})
  incrementCount() {
    let callCount = 0;
    let promise = NearPromise.new(CONTRACTS[0]).functionCall(
      "getCount",
      NO_ARGS,
      BigInt(0),
      THIRTY_TGAS
    );
    callCount++;
    near.log(`Call count is now ${callCount}`);
    for (let i = 1; i < CONTRACTS.length; i++) {
      promise = promise.and(
        NearPromise.new(CONTRACTS[i]).functionCall(
          "getCount",
          NO_ARGS,
          BigInt(0),
          THIRTY_TGAS
        )
      );
      callCount++;
      near.log(`Call count is now ${callCount}`);
    }
    promise = promise.then(
      NearPromise.new(near.currentAccountId()).functionCall(
        "_incrementCountCallback",
        serialize({ callCount }),
        BigInt(0),
        THIRTY_TGAS
      )
    );
    near.log(`Finished incrementCount with callCount: ${callCount}`);
    return promise.asReturn();
  }

  @call({ privateFunction: true })
  _incrementCountCallback({ callCount }) {
    near.log(`Entered _incrementCallback with callCount: ${callCount}`);
    for (let i = 0; i < callCount; i++) {
      const promiseResult = near.promiseResult(i);
      const result = JSON.parse(promiseResult);
      this.count += result;
      near.log(`Count is now ${this.count}`);
    }
    return this.count;
  }

  @view({})
  getCount() {
    return this.count;
  }
}
