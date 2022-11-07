import { NearBindgen, near, call, initialize, assert } from 'near-sdk-js';

@NearBindgen({requireInit: true})
class ProgrammaticUpdate {

  manager: string = "manager";

  @initialize({privateFunction: true})  // This method can only be called by the contract's account
  init({ manager }:{manager: string}) {
    near.log(`Setting manager to be ${manager}`)
    this.manager = manager;
    near.log(`Manager is ${this.manager}`)
  }

  @call({}) // This method update the code
  updateContract(): void {
    near.log(`Manager = ${this.manager}`)
    near.log(`Caller = ${near.predecessorAccountId()}`)
    assert(near.predecessorAccountId() === this.manager, "Only the manager can update the code")
    
    // QUESTION: HOW DO WE GET A WASM CODE PASSED AS ARGS?
    const args = JSON.parse(near.input());

    const promise = near.promiseBatchCreate(near.currentAccountId());

    // QUESTION: DO WE NEED TO RESOLVE THIS PROMISE FOR IT TO RUN?
    near.promiseBatchActionDeployContract(promise, args.code)
  }
}