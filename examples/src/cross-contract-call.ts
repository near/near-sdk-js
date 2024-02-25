import { NearBindgen, call, view, initialize, near, bytes } from "near-sdk-js";

@NearBindgen({ requireInit: true })
export class OnCall {
  personOnCall:string ="";
  statusMessageContract:string ="";

  @initialize({})
  init({ statusMessageContract }) {
    this.statusMessageContract = statusMessageContract;
  }

  @call({})
  set_person_on_call({ accountId }) {
    near.log(`Trying to set ${accountId} on-call`);
    const promise = near.promiseBatchCreate(this.statusMessageContract);
    near.promiseBatchActionFunctionCall(
      promise,
      "get_status",
      JSON.stringify({ account_id: accountId }),
      0,
      30000000000000
    );
    near.promiseThen(
      promise,
      near.currentAccountId(),
      "_set_person_on_call_private",
      JSON.stringify({ accountId: accountId }),
      0,
      30000000000000
    );
  }

  @call({ privateFunction: true })
  _set_person_on_call_private({ accountId }) {
    near.log(`_set_person_on_call_private called, accountId ${accountId}`);
    const status = JSON.parse(near.promiseResult(0));
    near.log(`${accountId} status is ${status}`);
    if (status === "AVAILABLE") {
      this.personOnCall = accountId;
      near.log(`${accountId} set on-call`);
    } else {
      near.log(`${accountId} can not be set on-call`);
    }
  }

  @view({})
  person_on_call() {
    near.log(`Returning person on-call: ${this.personOnCall}`);
    return this.personOnCall;
  }
}
