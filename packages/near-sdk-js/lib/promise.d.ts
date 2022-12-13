import { PromiseIndex } from "./utils";
import { Balance, PublicKey, AccountId, Gas, GasWeight } from "./types";
import { Nonce } from "./types/primitives";
/**
 * A promise action which can be executed on the NEAR blockchain.
 */
export declare abstract class PromiseAction {
    /**
     * The method that describes how a promise action adds it's _action_ to the promise batch with the provided index.
     *
     * @param promiseIndex - The index of the promise batch to attach the action to.
     */
    abstract add(promiseIndex: PromiseIndex): void;
}
/**
 * A create account promise action.
 *
 * @extends {PromiseAction}
 */
export declare class CreateAccount extends PromiseAction {
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A deploy contract promise action.
 *
 * @extends {PromiseAction}
 */
export declare class DeployContract extends PromiseAction {
    code: Uint8Array;
    /**
     * @param code - The code of the contract to be deployed.
     */
    constructor(code: Uint8Array);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A function call promise action.
 *
 * @extends {PromiseAction}
 */
export declare class FunctionCall extends PromiseAction {
    functionName: string;
    args: string;
    amount: Balance;
    gas: Gas;
    /**
     * @param functionName - The name of the function to be called.
     * @param args - The utf-8 string arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     */
    constructor(functionName: string, args: string, amount: Balance, gas: Gas);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A function call raw promise action.
 *
 * @extends {PromiseAction}
 */
export declare class FunctionCallRaw extends PromiseAction {
    functionName: string;
    args: Uint8Array;
    amount: Balance;
    gas: Gas;
    /**
     * @param functionName - The name of the function to be called.
     * @param args - The arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     */
    constructor(functionName: string, args: Uint8Array, amount: Balance, gas: Gas);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A function call weight promise action.
 *
 * @extends {PromiseAction}
 */
export declare class FunctionCallWeight extends PromiseAction {
    functionName: string;
    args: string;
    amount: Balance;
    gas: Gas;
    weight: GasWeight;
    /**
     * @param functionName - The name of the function to be called.
     * @param args - The utf-8 string arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     * @param weight - The weight of unused Gas to use.
     */
    constructor(functionName: string, args: string, amount: Balance, gas: Gas, weight: GasWeight);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A function call weight raw promise action.
 *
 * @extends {PromiseAction}
 */
export declare class FunctionCallWeightRaw extends PromiseAction {
    functionName: string;
    args: Uint8Array;
    amount: Balance;
    gas: Gas;
    weight: GasWeight;
    /**
     * @param functionName - The name of the function to be called.
     * @param args - The arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     * @param weight - The weight of unused Gas to use.
     */
    constructor(functionName: string, args: Uint8Array, amount: Balance, gas: Gas, weight: GasWeight);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A transfer promise action.
 *
 * @extends {PromiseAction}
 */
export declare class Transfer extends PromiseAction {
    amount: Balance;
    /**
     * @param amount - The amount of NEAR to tranfer.
     */
    constructor(amount: Balance);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A stake promise action.
 *
 * @extends {PromiseAction}
 */
export declare class Stake extends PromiseAction {
    amount: Balance;
    publicKey: PublicKey;
    /**
     * @param amount - The amount of NEAR to tranfer.
     * @param publicKey - The public key to use for staking.
     */
    constructor(amount: Balance, publicKey: PublicKey);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A add full access key promise action.
 *
 * @extends {PromiseAction}
 */
export declare class AddFullAccessKey extends PromiseAction {
    publicKey: PublicKey;
    nonce: Nonce;
    /**
     * @param publicKey - The public key to add as a full access key.
     * @param nonce - The nonce to use.
     */
    constructor(publicKey: PublicKey, nonce: Nonce);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A add access key promise action.
 *
 * @extends {PromiseAction}
 */
export declare class AddAccessKey extends PromiseAction {
    publicKey: PublicKey;
    allowance: Balance;
    receiverId: AccountId;
    functionNames: string;
    nonce: Nonce;
    /**
     * @param publicKey - The public key to add as a access key.
     * @param allowance - The allowance for the key in yoctoNEAR.
     * @param receiverId - The account ID of the reciever.
     * @param functionNames - The names of funcitons to authorize.
     * @param nonce - The nonce to use.
     */
    constructor(publicKey: PublicKey, allowance: Balance, receiverId: AccountId, functionNames: string, nonce: Nonce);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A delete key promise action.
 *
 * @extends {PromiseAction}
 */
export declare class DeleteKey extends PromiseAction {
    publicKey: PublicKey;
    /**
     * @param publicKey - The public key to delete from the account.
     */
    constructor(publicKey: PublicKey);
    add(promiseIndex: PromiseIndex): void;
}
/**
 * A delete account promise action.
 *
 * @extends {PromiseAction}
 */
export declare class DeleteAccount extends PromiseAction {
    beneficiaryId: AccountId;
    /**
     * @param beneficiaryId - The beneficiary of the account deletion - the account to recieve all of the remaining funds of the deleted account.
     */
    constructor(beneficiaryId: AccountId);
    add(promiseIndex: PromiseIndex): void;
}
declare class PromiseSingle {
    accountId: AccountId;
    actions: PromiseAction[];
    after: NearPromise | null;
    promiseIndex: PromiseIndex | null;
    constructor(accountId: AccountId, actions: PromiseAction[], after: NearPromise | null, promiseIndex: PromiseIndex | null);
    constructRecursively(): PromiseIndex;
}
export declare class PromiseJoint {
    promiseA: NearPromise;
    promiseB: NearPromise;
    promiseIndex: PromiseIndex | null;
    constructor(promiseA: NearPromise, promiseB: NearPromise, promiseIndex: PromiseIndex | null);
    constructRecursively(): PromiseIndex;
}
declare type PromiseSubtype = PromiseSingle | PromiseJoint;
/**
 * A high level class to construct and work with NEAR promises.
 */
export declare class NearPromise {
    private subtype;
    private shouldReturn;
    /**
     * @param subtype - The subtype of the promise.
     * @param shouldReturn - Whether the promise should return.
     */
    constructor(subtype: PromiseSubtype, shouldReturn: boolean);
    /**
     * Creates a new promise to the provided account ID.
     *
     * @param accountId - The account ID on which to call the promise.
     */
    static new(accountId: AccountId): NearPromise;
    private addAction;
    /**
     * Creates a create account promise action and adds it to the current promise.
     */
    createAccount(): NearPromise;
    /**
     * Creates a deploy contract promise action and adds it to the current promise.
     *
     * @param code - The code of the contract to be deployed.
     */
    deployContract(code: Uint8Array): NearPromise;
    /**
     * Creates a function call promise action and adds it to the current promise.
     *
     * @param functionName - The name of the function to be called.
     * @param args - The utf-8 string arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     */
    functionCall(functionName: string, args: string, amount: Balance, gas: Gas): NearPromise;
    /**
     * Creates a function call raw promise action and adds it to the current promise.
     *
     * @param functionName - The name of the function to be called.
     * @param args - The arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     */
    functionCallRaw(functionName: string, args: Uint8Array, amount: Balance, gas: Gas): NearPromise;
    /**
     * Creates a function call weight promise action and adds it to the current promise.
     *
     * @param functionName - The name of the function to be called.
     * @param args - The utf-8 string arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     * @param weight - The weight of unused Gas to use.
     */
    functionCallWeight(functionName: string, args: string, amount: Balance, gas: Gas, weight: GasWeight): NearPromise;
    /**
     * Creates a function call weight raw promise action and adds it to the current promise.
     *
     * @param functionName - The name of the function to be called.
     * @param args - The arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     * @param weight - The weight of unused Gas to use.
     */
    functionCallWeightRaw(functionName: string, args: Uint8Array, amount: Balance, gas: Gas, weight: GasWeight): NearPromise;
    /**
     * Creates a transfer promise action and adds it to the current promise.
     *
     * @param amount - The amount of NEAR to tranfer.
     */
    transfer(amount: Balance): NearPromise;
    /**
     * Creates a stake promise action and adds it to the current promise.
     *
     * @param amount - The amount of NEAR to tranfer.
     * @param publicKey - The public key to use for staking.
     */
    stake(amount: Balance, publicKey: PublicKey): NearPromise;
    /**
     * Creates a add full access key promise action and adds it to the current promise.
     * Uses 0n as the nonce.
     *
     * @param publicKey - The public key to add as a full access key.
     */
    addFullAccessKey(publicKey: PublicKey): NearPromise;
    /**
     * Creates a add full access key promise action and adds it to the current promise.
     * Allows you to specify the nonce.
     *
     * @param publicKey - The public key to add as a full access key.
     * @param nonce - The nonce to use.
     */
    addFullAccessKeyWithNonce(publicKey: PublicKey, nonce: Nonce): NearPromise;
    /**
     * Creates a add access key promise action and adds it to the current promise.
     * Uses 0n as the nonce.
     *
     * @param publicKey - The public key to add as a access key.
     * @param allowance - The allowance for the key in yoctoNEAR.
     * @param receiverId - The account ID of the reciever.
     * @param functionNames - The names of funcitons to authorize.
     */
    addAccessKey(publicKey: PublicKey, allowance: Balance, receiverId: AccountId, functionNames: string): NearPromise;
    /**
     * Creates a add access key promise action and adds it to the current promise.
     * Allows you to specify the nonce.
     *
     * @param publicKey - The public key to add as a access key.
     * @param allowance - The allowance for the key in yoctoNEAR.
     * @param receiverId - The account ID of the reciever.
     * @param functionNames - The names of funcitons to authorize.
     * @param nonce - The nonce to use.
     */
    addAccessKeyWithNonce(publicKey: PublicKey, allowance: Balance, receiverId: AccountId, functionNames: string, nonce: Nonce): NearPromise;
    /**
     * Creates a delete key promise action and adds it to the current promise.
     *
     * @param publicKey - The public key to delete from the account.
     */
    deleteKey(publicKey: PublicKey): NearPromise;
    /**
     * Creates a delete account promise action and adds it to the current promise.
     *
     * @param beneficiaryId - The beneficiary of the account deletion - the account to recieve all of the remaining funds of the deleted account.
     */
    deleteAccount(beneficiaryId: AccountId): NearPromise;
    /**
     * Joins the provided promise with the current promise, making the current promise a joint promise subtype.
     *
     * @param other - The promise to join with the current promise.
     */
    and(other: NearPromise): NearPromise;
    /**
     * Adds a callback to the current promise.
     *
     * @param other - The promise to be executed as the promise.
     */
    then(other: NearPromise): NearPromise;
    /**
     * Sets the shouldReturn field to true.
     */
    asReturn(): NearPromise;
    /**
     * Recursively goes through the current promise to get the promise index.
     */
    constructRecursively(): PromiseIndex;
    /**
     * Called by NearBindgen, when return object is a NearPromise instance.
     */
    onReturn(): void;
}
export declare type PromiseOrValue<T> = NearPromise | T;
export {};
