import { Bytes, PromiseIndex } from './utils'
import * as near from './api'
import { Balance, PublicKey, AccountId, Gas, GasWeight } from './types'
import { Nonce } from './types/primitives'

export abstract class PromiseAction {
  abstract add(promiseIndex: PromiseIndex): void
}

export class CreateAccount extends PromiseAction {
  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionCreateAccount(promiseIndex)
  }
}

export class DeployContract extends PromiseAction {
  constructor(public code: Bytes) {
    super()
  }

  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionDeployContract(promiseIndex, this.code)
  }
}

export class FunctionCall extends PromiseAction {
  constructor(public functionName: string, public args: Bytes, public amount: Balance, public gas: Gas) {
    super()
  }

  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionFunctionCall(promiseIndex, this.functionName, this.args, this.amount, this.gas)
  }
}

export class FunctionCallWeight extends PromiseAction {
  constructor(
    public functionName: string,
    public args: Bytes,
    public amount: Balance,
    public gas: Gas,
    public weight: GasWeight
  ) {
    super()
  }

  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionFunctionCallWeight(
      promiseIndex,
      this.functionName,
      this.args,
      this.amount,
      this.gas,
      this.weight
    )
  }
}

export class Transfer extends PromiseAction {
  constructor(public amount: Balance) {
    super()
  }

  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionTransfer(promiseIndex, this.amount)
  }
}

export class Stake extends PromiseAction {
  constructor(public amount: Balance, public publicKey: PublicKey) {
    super()
  }

  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionStake(promiseIndex, this.amount, this.publicKey.data)
  }
}

export class AddFullAccessKey extends PromiseAction {
  constructor(public publicKey: PublicKey, public nonce: Nonce) {
    super()
  }

  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionAddKeyWithFullAccess(promiseIndex, this.publicKey.data, this.nonce)
  }
}

export class AddAccessKey extends PromiseAction {
  constructor(
    public publicKey: PublicKey,
    public allowance: Balance,
    public receiverId: AccountId,
    public functionNames: string,
    public nonce: Nonce
  ) {
    super()
  }

  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionAddKeyWithFunctionCall(
      promiseIndex,
      this.publicKey.data,
      this.nonce,
      this.allowance,
      this.receiverId,
      this.functionNames
    )
  }
}

export class DeleteKey extends PromiseAction {
  constructor(public publicKey: PublicKey) {
    super()
  }

  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionDeleteKey(promiseIndex, this.publicKey.data)
  }
}

export class DeleteAccount extends PromiseAction {
  constructor(public beneficiaryId: AccountId) {
    super()
  }

  add(promiseIndex: PromiseIndex) {
    near.promiseBatchActionDeleteAccount(promiseIndex, this.beneficiaryId)
  }
}

class PromiseSingle {
  constructor(
    public accountId: AccountId,
    public actions: PromiseAction[],
    public after: NearPromise | null,
    public promiseIndex: PromiseIndex | null
  ) {}

  constructRecursively(): PromiseIndex {
    if (this.promiseIndex !== null) {
      return this.promiseIndex
    }

    let promiseIndex: bigint

    if (this.after) {
      promiseIndex = near.promiseBatchThen(this.after.constructRecursively(), this.accountId)
    } else {
      promiseIndex = near.promiseBatchCreate(this.accountId)
    }

    for (const action of this.actions) {
      action.add(promiseIndex)
    }

    this.promiseIndex = promiseIndex

    return promiseIndex
  }
}

export class PromiseJoint {
  constructor(public promiseA: NearPromise, public promiseB: NearPromise, public promiseIndex: PromiseIndex | null) {}

  constructRecursively(): PromiseIndex {
    if (this.promiseIndex !== null) {
      return this.promiseIndex
    }

    const result = near.promiseAnd(
      BigInt(this.promiseA.constructRecursively()),
      BigInt(this.promiseB.constructRecursively())
    )
    this.promiseIndex = result

    return result
  }
}

type PromiseSubtype = PromiseSingle | PromiseJoint

export class NearPromise {
  constructor(private subtype: PromiseSubtype, private shouldReturn: boolean) {}

  static new(accountId: AccountId): NearPromise {
    const subtype = new PromiseSingle(accountId, [], null, null)
    return new NearPromise(subtype, false)
  }

  private addAction(action: PromiseAction): NearPromise {
    if (this.subtype instanceof PromiseJoint) {
      throw new Error('Cannot add action to a joint promise.')
    }

    this.subtype.actions.push(action)

    return this
  }

  createAccount(): NearPromise {
    return this.addAction(new CreateAccount())
  }

  deployContract(code: Bytes): NearPromise {
    return this.addAction(new DeployContract(code))
  }

  functionCall(functionName: string, args: Bytes, amount: Balance, gas: Gas): NearPromise {
    return this.addAction(new FunctionCall(functionName, args, amount, gas))
  }

  functionCallWeight(functionName: string, args: Bytes, amount: Balance, gas: Gas, weight: GasWeight): NearPromise {
    return this.addAction(new FunctionCallWeight(functionName, args, amount, gas, weight))
  }

  transfer(amount: Balance): NearPromise {
    return this.addAction(new Transfer(amount))
  }

  stake(amount: Balance, publicKey: PublicKey): NearPromise {
    return this.addAction(new Stake(amount, publicKey))
  }

  addFullAccessKey(publicKey: PublicKey): NearPromise {
    return this.addFullAccessKeyWithNonce(publicKey, 0n)
  }

  addFullAccessKeyWithNonce(publicKey: PublicKey, nonce: Nonce): NearPromise {
    return this.addAction(new AddFullAccessKey(publicKey, nonce))
  }

  addAccessKey(publicKey: PublicKey, allowance: Balance, receiverId: AccountId, methodNames: string): NearPromise {
    return this.addAccessKeyWithNonce(publicKey, allowance, receiverId, methodNames, 0n)
  }

  addAccessKeyWithNonce(
    publicKey: PublicKey,
    allowance: Balance,
    receiverId: AccountId,
    methodNames: string,
    nonce: Nonce
  ): NearPromise {
    return this.addAction(new AddAccessKey(publicKey, allowance, receiverId, methodNames, nonce))
  }

  deleteKey(publicKey: PublicKey): NearPromise {
    return this.addAction(new DeleteKey(publicKey))
  }

  deleteAccount(beneficiaryId: AccountId): NearPromise {
    return this.addAction(new DeleteAccount(beneficiaryId))
  }

  and(other: NearPromise): NearPromise {
    const subtype = new PromiseJoint(this, other, null)
    return new NearPromise(subtype, false)
  }

  then(other: NearPromise): NearPromise {
    if (!(other.subtype instanceof PromiseSingle)) {
      throw new Error('Cannot callback joint promise.')
    }

    if (other.subtype.after !== null) {
      throw new Error('Cannot callback promise which is already scheduled after another')
    }

    other.subtype.after = this

    return other
  }

  asReturn(): NearPromise {
    this.shouldReturn = true
    return this
  }

  constructRecursively(): PromiseIndex {
    const result = this.subtype.constructRecursively()

    if (this.shouldReturn) {
      near.promiseReturn(result)
    }

    return result
  }

  // Called by NearBindgen, when return object is a NearPromise instance.
  onReturn() {
    this.asReturn().constructRecursively()
  }
}

export type PromiseOrValue<T> = NearPromise | T
