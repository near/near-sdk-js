import { Bytes, PromiseIndex } from './utils';
import { Balance, PublicKey, AccountId, Gas, GasWeight } from './types';
import { Nonce } from './types/primitives';
export declare abstract class PromiseAction {
    abstract add(promiseIndex: PromiseIndex): void;
}
export declare class CreateAccount extends PromiseAction {
    add(promiseIndex: PromiseIndex): void;
}
export declare class DeployContract extends PromiseAction {
    code: Bytes;
    constructor(code: Bytes);
    add(promiseIndex: PromiseIndex): void;
}
export declare class FunctionCall extends PromiseAction {
    functionName: string;
    args: Bytes;
    amount: Balance;
    gas: Gas;
    constructor(functionName: string, args: Bytes, amount: Balance, gas: Gas);
    add(promiseIndex: PromiseIndex): void;
}
export declare class FunctionCallWeight extends PromiseAction {
    functionName: string;
    args: Bytes;
    amount: Balance;
    gas: Gas;
    weight: GasWeight;
    constructor(functionName: string, args: Bytes, amount: Balance, gas: Gas, weight: GasWeight);
    add(promiseIndex: PromiseIndex): void;
}
export declare class Transfer extends PromiseAction {
    amount: Balance;
    constructor(amount: Balance);
    add(promiseIndex: PromiseIndex): void;
}
export declare class Stake extends PromiseAction {
    amount: Balance;
    publicKey: PublicKey;
    constructor(amount: Balance, publicKey: PublicKey);
    add(promiseIndex: PromiseIndex): void;
}
export declare class AddFullAccessKey extends PromiseAction {
    publicKey: PublicKey;
    nonce: Nonce;
    constructor(publicKey: PublicKey, nonce: Nonce);
    add(promiseIndex: PromiseIndex): void;
}
export declare class AddAccessKey extends PromiseAction {
    publicKey: PublicKey;
    allowance: Balance;
    receiverId: AccountId;
    functionNames: string;
    nonce: Nonce;
    constructor(publicKey: PublicKey, allowance: Balance, receiverId: AccountId, functionNames: string, nonce: Nonce);
    add(promiseIndex: PromiseIndex): void;
}
export declare class DeleteKey extends PromiseAction {
    publicKey: PublicKey;
    constructor(publicKey: PublicKey);
    add(promiseIndex: PromiseIndex): void;
}
export declare class DeleteAccount extends PromiseAction {
    beneficiaryId: AccountId;
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
export declare class NearPromise {
    private subtype;
    private shouldReturn;
    constructor(subtype: PromiseSubtype, shouldReturn: boolean);
    static new(accountId: AccountId): NearPromise;
    private addAction;
    createAccount(): NearPromise;
    deployContract(code: Bytes): NearPromise;
    functionCall(functionName: string, args: Bytes, amount: Balance, gas: Gas): NearPromise;
    functionCallWeight(functionName: string, args: Bytes, amount: Balance, gas: Gas, weight: GasWeight): NearPromise;
    transfer(amount: Balance): NearPromise;
    stake(amount: Balance, publicKey: PublicKey): NearPromise;
    addFullAccessKey(publicKey: PublicKey): NearPromise;
    addFullAccessKeyWithNonce(publicKey: PublicKey, nonce: Nonce): NearPromise;
    addAccessKey(publicKey: PublicKey, allowance: Balance, receiverId: AccountId, methodNames: string): NearPromise;
    addAccessKeyWithNonce(publicKey: PublicKey, allowance: Balance, receiverId: AccountId, methodNames: string, nonce: Nonce): NearPromise;
    deleteKey(publicKey: PublicKey): NearPromise;
    deleteAccount(beneficiaryId: AccountId): NearPromise;
    and(other: NearPromise): NearPromise;
    then(other: NearPromise): NearPromise;
    asReturn(): NearPromise;
    constructRecursively(): PromiseIndex;
    onReturn(): void;
}
export declare type PromiseOrValue<T> = NearPromise | T;
export {};
