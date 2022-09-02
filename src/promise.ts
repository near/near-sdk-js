import { Bytes } from "./utils";
import * as near from "./api";
import { Balance, PublicKey, AccountId, Gas, GasWeight } from "./types";
import { Nonce } from "./types/primitives";

export abstract class PromiseAction {
    abstract add(promise_index: number | bigint): void;
}

export class CreateAccount extends PromiseAction {
    add(promise_index: number | bigint) {
        near.promiseBatchActionCreateAccount(promise_index);
    }
}

export class DeployContract extends PromiseAction {
    constructor(public code: Bytes) { super() }

    add(promise_index: number | bigint) {
        near.promiseBatchActionDeployContract(promise_index, this.code);
    }
}

export class FunctionCall extends PromiseAction{
    constructor(public function_name: string, public args: Bytes, public amount: Balance, public gas: Gas) { super() }

    add(promise_index: number | bigint) {
        near.promiseBatchActionFunctionCall(promise_index, this.function_name, this.args, this.amount, this.gas);
    }
}

export class FunctionCallWeight extends PromiseAction {
    constructor(public function_name: string, public args: Bytes, public amount: Balance, public gas: Gas, public weight: GasWeight) { super() }
    
    add(promise_index: number | bigint) {
        near.promiseBatchActionFunctionCallWeight(promise_index, this.function_name, this.args, this.amount, this.gas, this.weight);
    }
}

export class Transfer extends PromiseAction {
    constructor(public amount: Balance) { super() }

    add(promise_index: number | bigint) {
        near.promiseBatchActionTransfer(promise_index, this.amount);
    }
}

export class Stake extends PromiseAction {
    constructor(public amount: Balance, public public_key: PublicKey) { super() }

    add(promise_index: number | bigint) {
        near.promiseBatchActionStake(promise_index, this.amount, this.public_key.data);
    }
}

export class AddFullAccessKey extends PromiseAction {
    constructor(public public_key: PublicKey, public nonce: Nonce) { super() }

    add(promise_index: number | bigint) {
        near.promiseBatchActionAddKeyWithFullAccess(promise_index, this.public_key.data, this.nonce);
    }
}

export class AddAccessKey extends PromiseAction {
    constructor(public public_key: PublicKey, public allowance: Balance, public receiver_id: AccountId, public function_names: string, public nonce: Nonce) { super() }

    add(promise_index: number | bigint) {
        near.promiseBatchActionAddKeyWithFunctionCall(promise_index, this.public_key.data, this.nonce, this.allowance, this.receiver_id, this.function_names);
    }
}

export class DeleteKey extends PromiseAction {
    constructor(public public_key: PublicKey) { super() }

    add(promise_index: number | bigint) {
        near.promiseBatchActionDeleteKey(promise_index, this.public_key.data);
    }
}

export class DeleteAccount extends PromiseAction {
    constructor(public beneficiary_id: AccountId) { super() }

    add(promise_index: number | bigint) {
        near.promiseBatchActionDeleteAccount(promise_index, this.beneficiary_id);
    }
}

class PromiseSingle {
    constructor(public account_id: AccountId, public actions: PromiseAction[], public after: NearPromise | null, public promise_index: number | bigint | null) { }

    constructRecursively(): number | bigint {
        if (this.promise_index !== null) {
            return this.promise_index;
        }
        let promise_index;
        if (this.after) {
            promise_index = near.promiseBatchThen(this.after.constructRecursively(), this.account_id)
        } else {
            promise_index = near.promiseBatchCreate(this.account_id);
        }
        for (let action of this.actions) {
            action.add(promise_index);
        }
        this.promise_index = promise_index;
        return promise_index
    }
}

export class PromiseJoint {
    constructor(public promise_a: NearPromise, public promise_b: NearPromise, public promise_index: number | bigint | null) { }

    constructRecursively(): number | bigint {
        if (this.promise_index !== null) {
            return this.promise_index;
        }
        let res = near.promiseAnd(BigInt(this.promise_a.constructRecursively()), BigInt(this.promise_b.constructRecursively()));
        this.promise_index = res
        return res
    }
}

type PromiseSubtype = PromiseSingle | PromiseJoint;

export class NearPromise {
    constructor(private subtype: PromiseSubtype, private should_return: boolean) { }

    static new(account_id: AccountId): NearPromise {
        let subtype = new PromiseSingle(account_id, [], null, null);
        let ret =  new NearPromise(subtype, false); 
        return ret;
    }

    private add_action(action: PromiseAction): NearPromise{
        if (this.subtype instanceof PromiseJoint) {
            throw new Error("Cannot add action to a joint promise.")
        } else {
            this.subtype.actions.push(action);
        }
        return this;
    }

    createAccount(): NearPromise {
        return this.add_action(new CreateAccount());
    }

    deployContract(code: Bytes): NearPromise {
        return this.add_action(new DeployContract(code));
    }

    functionCall(function_name: string, args: Bytes, amount: Balance, gas: Gas): NearPromise {
        return this.add_action(new FunctionCall(function_name, args, amount, gas));
    }

    functionCallWeight(function_name: string, args: Bytes, amount: Balance, gas: Gas, weight: GasWeight): NearPromise {
        return this.add_action(new FunctionCallWeight(function_name, args, amount, gas, weight));
    }

    transfer(amount: Balance): NearPromise {
        return this.add_action(new Transfer(amount));
    }

    stake(amount: Balance, public_key: PublicKey): NearPromise {
        return this.add_action(new Stake(amount, public_key));
    }

    addFullAccessKey(public_key: PublicKey): NearPromise {
        return this.addFullAccessKeyWithNonce(public_key, 0n)
    }

    addFullAccessKeyWithNonce(public_key: PublicKey, nonce: Nonce): NearPromise {
        return this.add_action(new AddFullAccessKey(public_key, nonce));
    }

    addAccessKey(public_key: PublicKey, allowance: Balance, receiver_id: AccountId, method_names: string): NearPromise {
        return this.addAccessKeyWithNonce(public_key, allowance, receiver_id, method_names, 0n)
    }

    addAccessKeyWithNonce(public_key: PublicKey, allowance: Balance, receiver_id: AccountId, method_names: string, nonce: Nonce): NearPromise {
        return this.add_action(new AddAccessKey(public_key, allowance, receiver_id, method_names, nonce));
    }

    deleteKey(public_key: PublicKey): NearPromise {
        return this.add_action(new DeleteKey(public_key));
    }

    deleteAccount(beneficiary_id: AccountId): NearPromise {
        return this.add_action(new DeleteAccount(beneficiary_id));
    }

    and(other: NearPromise): NearPromise {
        let subtype = new PromiseJoint(this, other, null);
        let ret = new NearPromise(subtype, false);
        return ret;
    }

    then(other: NearPromise): NearPromise {
        if (other.subtype instanceof PromiseSingle) {
            if (other.subtype.after !== null) {
                throw new Error("Cannot callback promise which is already scheduled after another");
            }
            other.subtype.after = this;
        } else {
            throw new Error("Cannot callback joint promise.")
        }
        return other;
    }

    asReturn(): NearPromise {
        this.should_return = true;
        return this;
    }

    constructRecursively(): number | bigint {
        let res = this.subtype.constructRecursively();
        if (this.should_return) {
            near.promiseReturn(res);
        }
        return res;
    }

    // Called by NearBindgen, when return object is a NearPromise instance.
    onReturn() {
        this.constructRecursively();
    }
}

export type PromiseOrValue<T> = NearPromise | T;

