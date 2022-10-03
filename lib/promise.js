import * as near from "./api";
export class PromiseAction {
}
export class CreateAccount extends PromiseAction {
    add(promiseIndex) {
        near.promiseBatchActionCreateAccount(promiseIndex);
    }
}
export class DeployContract extends PromiseAction {
    constructor(code) {
        super();
        this.code = code;
    }
    add(promiseIndex) {
        near.promiseBatchActionDeployContract(promiseIndex, this.code);
    }
}
export class FunctionCall extends PromiseAction {
    constructor(functionName, args, amount, gas) {
        super();
        this.functionName = functionName;
        this.args = args;
        this.amount = amount;
        this.gas = gas;
    }
    add(promiseIndex) {
        near.promiseBatchActionFunctionCall(promiseIndex, this.functionName, this.args, this.amount, this.gas);
    }
}
export class FunctionCallWeight extends PromiseAction {
    constructor(functionName, args, amount, gas, weight) {
        super();
        this.functionName = functionName;
        this.args = args;
        this.amount = amount;
        this.gas = gas;
        this.weight = weight;
    }
    add(promiseIndex) {
        near.promiseBatchActionFunctionCallWeight(promiseIndex, this.functionName, this.args, this.amount, this.gas, this.weight);
    }
}
export class Transfer extends PromiseAction {
    constructor(amount) {
        super();
        this.amount = amount;
    }
    add(promiseIndex) {
        near.promiseBatchActionTransfer(promiseIndex, this.amount);
    }
}
export class Stake extends PromiseAction {
    constructor(amount, publicKey) {
        super();
        this.amount = amount;
        this.publicKey = publicKey;
    }
    add(promiseIndex) {
        near.promiseBatchActionStake(promiseIndex, this.amount, this.publicKey.data);
    }
}
export class AddFullAccessKey extends PromiseAction {
    constructor(publicKey, nonce) {
        super();
        this.publicKey = publicKey;
        this.nonce = nonce;
    }
    add(promiseIndex) {
        near.promiseBatchActionAddKeyWithFullAccess(promiseIndex, this.publicKey.data, this.nonce);
    }
}
export class AddAccessKey extends PromiseAction {
    constructor(publicKey, allowance, receiverId, functionNames, nonce) {
        super();
        this.publicKey = publicKey;
        this.allowance = allowance;
        this.receiverId = receiverId;
        this.functionNames = functionNames;
        this.nonce = nonce;
    }
    add(promiseIndex) {
        near.promiseBatchActionAddKeyWithFunctionCall(promiseIndex, this.publicKey.data, this.nonce, this.allowance, this.receiverId, this.functionNames);
    }
}
export class DeleteKey extends PromiseAction {
    constructor(publicKey) {
        super();
        this.publicKey = publicKey;
    }
    add(promiseIndex) {
        near.promiseBatchActionDeleteKey(promiseIndex, this.publicKey.data);
    }
}
export class DeleteAccount extends PromiseAction {
    constructor(beneficiaryId) {
        super();
        this.beneficiaryId = beneficiaryId;
    }
    add(promiseIndex) {
        near.promiseBatchActionDeleteAccount(promiseIndex, this.beneficiaryId);
    }
}
class PromiseSingle {
    constructor(accountId, actions, after, promiseIndex) {
        this.accountId = accountId;
        this.actions = actions;
        this.after = after;
        this.promiseIndex = promiseIndex;
    }
    constructRecursively() {
        if (this.promiseIndex !== null) {
            return this.promiseIndex;
        }
        let promiseIndex;
        if (this.after) {
            promiseIndex = near.promiseBatchThen(this.after.constructRecursively(), this.accountId);
        }
        else {
            promiseIndex = near.promiseBatchCreate(this.accountId);
        }
        for (const action of this.actions) {
            action.add(promiseIndex);
        }
        this.promiseIndex = promiseIndex;
        return promiseIndex;
    }
}
export class PromiseJoint {
    constructor(promiseA, promiseB, promiseIndex) {
        this.promiseA = promiseA;
        this.promiseB = promiseB;
        this.promiseIndex = promiseIndex;
    }
    constructRecursively() {
        if (this.promiseIndex !== null) {
            return this.promiseIndex;
        }
        const result = near.promiseAnd(BigInt(this.promiseA.constructRecursively()), BigInt(this.promiseB.constructRecursively()));
        this.promiseIndex = result;
        return result;
    }
}
export class NearPromise {
    constructor(subtype, shouldReturn) {
        this.subtype = subtype;
        this.shouldReturn = shouldReturn;
    }
    static new(accountId) {
        const subtype = new PromiseSingle(accountId, [], null, null);
        return new NearPromise(subtype, false);
    }
    addAction(action) {
        if (this.subtype instanceof PromiseJoint) {
            throw new Error("Cannot add action to a joint promise.");
        }
        this.subtype.actions.push(action);
        return this;
    }
    createAccount() {
        return this.addAction(new CreateAccount());
    }
    deployContract(code) {
        return this.addAction(new DeployContract(code));
    }
    functionCall(functionName, args, amount, gas) {
        return this.addAction(new FunctionCall(functionName, args, amount, gas));
    }
    functionCallWeight(functionName, args, amount, gas, weight) {
        return this.addAction(new FunctionCallWeight(functionName, args, amount, gas, weight));
    }
    transfer(amount) {
        return this.addAction(new Transfer(amount));
    }
    stake(amount, publicKey) {
        return this.addAction(new Stake(amount, publicKey));
    }
    addFullAccessKey(publicKey) {
        return this.addFullAccessKeyWithNonce(publicKey, 0n);
    }
    addFullAccessKeyWithNonce(publicKey, nonce) {
        return this.addAction(new AddFullAccessKey(publicKey, nonce));
    }
    addAccessKey(publicKey, allowance, receiverId, methodNames) {
        return this.addAccessKeyWithNonce(publicKey, allowance, receiverId, methodNames, 0n);
    }
    addAccessKeyWithNonce(publicKey, allowance, receiverId, methodNames, nonce) {
        return this.addAction(new AddAccessKey(publicKey, allowance, receiverId, methodNames, nonce));
    }
    deleteKey(publicKey) {
        return this.addAction(new DeleteKey(publicKey));
    }
    deleteAccount(beneficiaryId) {
        return this.addAction(new DeleteAccount(beneficiaryId));
    }
    and(other) {
        const subtype = new PromiseJoint(this, other, null);
        return new NearPromise(subtype, false);
    }
    then(other) {
        if (!(other.subtype instanceof PromiseSingle)) {
            throw new Error("Cannot callback joint promise.");
        }
        if (other.subtype.after !== null) {
            throw new Error("Cannot callback promise which is already scheduled after another");
        }
        other.subtype.after = this;
        return other;
    }
    asReturn() {
        this.shouldReturn = true;
        return this;
    }
    constructRecursively() {
        const result = this.subtype.constructRecursively();
        if (this.shouldReturn) {
            near.promiseReturn(result);
        }
        return result;
    }
    // Called by NearBindgen, when return object is a NearPromise instance.
    onReturn() {
        this.asReturn().constructRecursively();
    }
}
