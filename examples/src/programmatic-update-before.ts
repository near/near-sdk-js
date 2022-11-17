import { NearBindgen, near, initialize, assert, view } from 'near-sdk-js';
import { bytes } from '../../src/utils';

@NearBindgen({requireInit: true})
class ProgrammaticUpdateBefore {

  greeting: string = "Hello";

  @initialize({privateFunction: true}) 
  init({ manager }:{manager: string}) {
    near.log(`Setting manager to be ${manager}`)
    near.storageWrite("MANAGER", manager )
  }

  @view({}) // This method will be renamed after update and will return "Hi" if greeting is "Hello"
  get_greeting(): string {
    return this.greeting;
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