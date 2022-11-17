import { NearBindgen, near, initialize, assert, view, includeBytes, bytes } from 'near-sdk-js';

@NearBindgen({requireInit: true})
class ProgrammaticUpdateAfter {

  greeting: string = "Hello";

  @initialize({privateFunction: true}) 
  init({ manager }:{manager: string}) {
    near.log(`Setting manager to be ${manager}`)
    near.storageWrite("MANAGER", manager )
  }

  @view({}) // Method renamed and return "Hi" when greeting is "Hello"
  view_greeting(): string {
    return this.greeting.replace("Hello", "Hi");
  }
}


export function updateContract() {
  let manager = near.storageRead("MANAGER");
  assert(near.predecessorAccountId() === manager, "Only the manager can update the code")

  let promiseId = near.promiseBatchCreate(near.currentAccountId());
  near.promiseBatchActionDeployContract(
    promiseId,
    near.input()
  );
  
  return near.promiseReturn(promiseId);
}