import { call, near, NearBindgen, NearPromise, view, decode } from "near-sdk-js";

const CONTRACTS = [
  "first-contract.test.near",
  "second-contract.test.near",
  "third-contract.test.near",
];
const NO_ARGS = new Uint8Array();
const THIRTY_TGAS = BigInt("30" + "0".repeat(12));

@NearBindgen({})
export class LoopXCC {
  constructor() {
    this.count = 0;
  }

  @call({})
  incrementCount() {
    let promise = NearPromise.new(CONTRACTS[0]).functionCall(
      "getCount",
      NO_ARGS,
      BigInt(0),
      THIRTY_TGAS
    );
    for (let i = 1; i < CONTRACTS.length; i++) {
      promise = promise.and(
        NearPromise.new(CONTRACTS[i]).functionCall(
          "getCount",
          NO_ARGS,
          BigInt(0),
          THIRTY_TGAS
        )
      );
    }
    promise = promise.then(
      NearPromise.new(near.currentAccountId()).functionCall(
        "_incrementCountCallback",
        NO_ARGS,
        BigInt(0),
        THIRTY_TGAS
      )
    );
    return promise.asReturn();
  }

  @call({ privateFunction: true })
  _incrementCountCallback() {
    const callCount = near.promiseResultsCount();
    for (let i = 0; i < callCount; i++) {
      const promiseResult = near.promiseResult(i);
      const result = JSON.parse(decode(promiseResult));
      this.count += result;
    }
    return this.count;
  }

  @view({})
  getCount() {
    return this.count;
  }
}
