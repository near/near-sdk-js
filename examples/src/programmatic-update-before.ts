import { NearBindgen, near, initialize, assert, view, bytes, str } from "near-sdk-js";

@NearBindgen({ requireInit: true })
export class ProgrammaticUpdateBefore {
  greeting = "Hello";

  @initialize({ privateFunction: true })
  init({ manager }: { manager: string }) {
    near.log(`Setting manager to be ${manager}`);
    near.storageWrite(bytes("MANAGER"), bytes(manager));
  }

  @view({}) // This method will be renamed after update and will return "Hi" if greeting is "Hello"
  get_greeting(): string {
    return this.greeting;
  }
}

export function updateContract() {
  const manager = str(near.storageRead(bytes("MANAGER")));
  assert(
    near.predecessorAccountId() === manager,
    "Only the manager can update the code"
  );

  const promiseId = near.promiseBatchCreate(near.currentAccountId());
  near.promiseBatchActionDeployContract(promiseId, near.input());

  return near.promiseReturn(promiseId);
}
