import * as near from "./api";
export class PromiseAction {
}
export class CreateAccount extends PromiseAction {
    add(promise_index) {
        near.promiseBatchActionCreateAccount(promise_index);
    }
}
export class DeployContract extends PromiseAction {
    constructor(code) {
        super();
        this.code = code;
    }
    add(promise_index) {
        near.promiseBatchActionDeployContract(promise_index, this.code);
    }
}
export class FunctionCall extends PromiseAction {
    constructor(function_name, args, amount, gas) {
        super();
        this.function_name = function_name;
        this.args = args;
        this.amount = amount;
        this.gas = gas;
    }
    add(promise_index) {
        near.promiseBatchActionFunctionCall(promise_index, this.function_name, this.args, this.amount, this.gas);
    }
}
export class FunctionCallWeight extends PromiseAction {
    constructor(function_name, args, amount, gas, weight) {
        super();
        this.function_name = function_name;
        this.args = args;
        this.amount = amount;
        this.gas = gas;
        this.weight = weight;
    }
    add(promise_index) {
        near.promiseBatchActionFunctionCallWeight(promise_index, this.function_name, this.args, this.amount, this.gas, this.weight);
    }
}
export class Transfer extends PromiseAction {
    constructor(amount) {
        super();
        this.amount = amount;
    }
    add(promise_index) {
        near.promiseBatchActionTransfer(promise_index, this.amount);
    }
}
export class Stake extends PromiseAction {
    constructor(amount, public_key) {
        super();
        this.amount = amount;
        this.public_key = public_key;
    }
    add(promise_index) {
        near.promiseBatchActionStake(promise_index, this.amount, this.public_key.data);
    }
}
export class AddFullAccessKey extends PromiseAction {
    constructor(public_key, nonce) {
        super();
        this.public_key = public_key;
        this.nonce = nonce;
    }
    add(promise_index) {
        near.promiseBatchActionAddKeyWithFullAccess(promise_index, this.public_key.data, this.nonce);
    }
}
export class AddAccessKey extends PromiseAction {
    constructor(public_key, allowance, receiver_id, function_names, nonce) {
        super();
        this.public_key = public_key;
        this.allowance = allowance;
        this.receiver_id = receiver_id;
        this.function_names = function_names;
        this.nonce = nonce;
    }
    add(promise_index) {
        near.promiseBatchActionAddKeyWithFunctionCall(promise_index, this.public_key.data, this.nonce, this.allowance, this.receiver_id, this.function_names);
    }
}
export class DeleteKey extends PromiseAction {
    constructor(public_key) {
        super();
        this.public_key = public_key;
    }
    add(promise_index) {
        near.promiseBatchActionDeleteKey(promise_index, this.public_key.data);
    }
}
export class DeleteAccount extends PromiseAction {
    constructor(beneficiary_id) {
        super();
        this.beneficiary_id = beneficiary_id;
    }
    add(promise_index) {
        near.promiseBatchActionDeleteAccount(promise_index, this.beneficiary_id);
    }
}
class PromiseSingle {
    constructor(account_id, actions, after, promise_index) {
        this.account_id = account_id;
        this.actions = actions;
        this.after = after;
        this.promise_index = promise_index;
    }
    constructRecursively() {
        if (this.promise_index !== null) {
            return this.promise_index;
        }
        let promise_index;
        if (this.after) {
            promise_index = near.promiseBatchThen(this.after.constructRecursively(), this.account_id);
        }
        else {
            promise_index = near.promiseBatchCreate(this.account_id);
        }
        for (let action of this.actions) {
            action.add(promise_index);
        }
        this.promise_index = promise_index;
        return promise_index;
    }
}
export class PromiseJoint {
    constructor(promise_a, promise_b, promise_index) {
        this.promise_a = promise_a;
        this.promise_b = promise_b;
        this.promise_index = promise_index;
    }
    constructRecursively() {
        if (this.promise_index !== null) {
            return this.promise_index;
        }
        let res = near.promiseAnd(BigInt(this.promise_a.constructRecursively()), BigInt(this.promise_b.constructRecursively()));
        this.promise_index = res;
        return res;
    }
}
export class NearPromise {
    constructor(subtype, should_return) {
        this.subtype = subtype;
        this.should_return = should_return;
    }
    static new(account_id) {
        let subtype = new PromiseSingle(account_id, [], null, null);
        let ret = new NearPromise(subtype, false);
        return ret;
    }
    add_action(action) {
        if (this.subtype instanceof PromiseJoint) {
            throw new Error("Cannot add action to a joint promise.");
        }
        else {
            this.subtype.actions.push(action);
        }
        return this;
    }
    createAccount() {
        return this.add_action(new CreateAccount());
    }
    deployContract(code) {
        return this.add_action(new DeployContract(code));
    }
    functionCall(function_name, args, amount, gas) {
        return this.add_action(new FunctionCall(function_name, args, amount, gas));
    }
    functionCallWeight(function_name, args, amount, gas, weight) {
        return this.add_action(new FunctionCallWeight(function_name, args, amount, gas, weight));
    }
    transfer(amount) {
        return this.add_action(new Transfer(amount));
    }
    stake(amount, public_key) {
        return this.add_action(new Stake(amount, public_key));
    }
    addFullAccessKey(public_key) {
        return this.addFullAccessKeyWithNonce(public_key, 0n);
    }
    addFullAccessKeyWithNonce(public_key, nonce) {
        return this.add_action(new AddFullAccessKey(public_key, nonce));
    }
    addAccessKey(public_key, allowance, receiver_id, method_names) {
        return this.addAccessKeyWithNonce(public_key, allowance, receiver_id, method_names, 0n);
    }
    addAccessKeyWithNonce(public_key, allowance, receiver_id, method_names, nonce) {
        return this.add_action(new AddAccessKey(public_key, allowance, receiver_id, method_names, nonce));
    }
    deleteKey(public_key) {
        return this.add_action(new DeleteKey(public_key));
    }
    deleteAccount(beneficiary_id) {
        return this.add_action(new DeleteAccount(beneficiary_id));
    }
    and(other) {
        let subtype = new PromiseJoint(this, other, null);
        let ret = new NearPromise(subtype, false);
        return ret;
    }
    then(other) {
        if (other.subtype instanceof PromiseSingle) {
            if (other.subtype.after !== null) {
                throw new Error("Cannot callback promise which is already scheduled after another");
            }
            other.subtype.after = this;
        }
        else {
            throw new Error("Cannot callback joint promise.");
        }
        return other;
    }
    asReturn() {
        this.should_return = true;
        return this;
    }
    constructRecursively() {
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
