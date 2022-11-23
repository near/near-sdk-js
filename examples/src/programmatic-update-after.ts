import { NearBindgen, near, initialize, assert, view } from "near-sdk-js";

@NearBindgen({ requireInit: true })
export class ProgrammaticUpdateAfter {
  greeting = "Hello";

  @initialize({ privateFunction: true })
  init({ manager }: { manager: string }) {
    near.log(`Setting manager to be ${manager}`);
    near.storageWrite("MANAGER", manager);
  }

  @view({}) // Method renamed and return "Hi" when greeting is "Hello"
  view_greeting(): string {
    return this.greeting.replace("Hello", "Hi");
  }
}

export function updateContract() {
  const manager = near.storageRead("MANAGER");
  assert(
    near.predecessorAccountId() === manager,
    "Only the manager can update the code"
  );

  const promiseId = near.promiseBatchCreate(near.currentAccountId());
  near.promiseBatchActionDeployContract(promiseId, near.input());

  return near.promiseReturn(promiseId);
}
