import { Bytes } from "./utils";
import { Balance, PublicKey, AccountId, Gas, GasWeight } from "./types";
import { Nonce } from "./types/primitives";
export declare abstract class PromiseAction {
    abstract add(promise_index: number | bigint): void;
}
export declare class CreateAccount extends PromiseAction {
    add(promise_index: number | bigint): void;
}
export declare class DeployContract extends PromiseAction {
    code: Bytes;
    constructor(code: Bytes);
    add(promise_index: number | bigint): void;
}
export declare class FunctionCall extends PromiseAction {
    function_name: string;
    args: Bytes;
    amount: Balance;
    gas: Gas;
    constructor(function_name: string, args: Bytes, amount: Balance, gas: Gas);
    add(promise_index: number | bigint): void;
}
export declare class FunctionCallWeight extends PromiseAction {
    function_name: string;
    args: Bytes;
    amount: Balance;
    gas: Gas;
    weight: GasWeight;
    constructor(function_name: string, args: Bytes, amount: Balance, gas: Gas, weight: GasWeight);
    add(promise_index: number | bigint): void;
}
export declare class Transfer extends PromiseAction {
    amount: Balance;
    constructor(amount: Balance);
    add(promise_index: number | bigint): void;
}
export declare class Stake extends PromiseAction {
    amount: Balance;
    public_key: PublicKey;
    constructor(amount: Balance, public_key: PublicKey);
    add(promise_index: number | bigint): void;
}
export declare class AddFullAccessKey extends PromiseAction {
    public_key: PublicKey;
    nonce: Nonce;
    constructor(public_key: PublicKey, nonce: Nonce);
    add(promise_index: number | bigint): void;
}
export declare class AddAccessKey extends PromiseAction {
    public_key: PublicKey;
    allowance: Balance;
    receiver_id: AccountId;
    function_names: string;
    nonce: Nonce;
    constructor(public_key: PublicKey, allowance: Balance, receiver_id: AccountId, function_names: string, nonce: Nonce);
    add(promise_index: number | bigint): void;
}
export declare class DeleteKey extends PromiseAction {
    public_key: PublicKey;
    constructor(public_key: PublicKey);
    add(promise_index: number | bigint): void;
}
export declare class DeleteAccount extends PromiseAction {
    beneficiary_id: AccountId;
    constructor(beneficiary_id: AccountId);
    add(promise_index: number | bigint): void;
}
declare class PromiseSingle {
    account_id: AccountId;
    actions: PromiseAction[];
    after: NearPromise | null;
    promise_index: number | bigint | null;
    constructor(account_id: AccountId, actions: PromiseAction[], after: NearPromise | null, promise_index: number | bigint | null);
    constructRecursively(): number | bigint;
}
export declare class PromiseJoint {
    promise_a: NearPromise;
    promise_b: NearPromise;
    promise_index: number | bigint | null;
    constructor(promise_a: NearPromise, promise_b: NearPromise, promise_index: number | bigint | null);
    constructRecursively(): number | bigint;
}
declare type PromiseSubtype = PromiseSingle | PromiseJoint;
export declare class NearPromise {
    private subtype;
    private should_return;
    constructor(subtype: PromiseSubtype, should_return: boolean);
    static new(account_id: AccountId): NearPromise;
    private add_action;
    createAccount(): NearPromise;
    deployContract(code: Bytes): NearPromise;
    functionCall(function_name: string, args: Bytes, amount: Balance, gas: Gas): NearPromise;
    functionCallWeight(function_name: string, args: Bytes, amount: Balance, gas: Gas, weight: GasWeight): NearPromise;
    transfer(amount: Balance): NearPromise;
    stake(amount: Balance, public_key: PublicKey): NearPromise;
    addFullAccessKey(public_key: PublicKey): NearPromise;
    addFullAccessKeyWithNonce(public_key: PublicKey, nonce: Nonce): NearPromise;
    addAccessKey(public_key: PublicKey, allowance: Balance, receiver_id: AccountId, method_names: string): NearPromise;
    addAccessKeyWithNonce(public_key: PublicKey, allowance: Balance, receiver_id: AccountId, method_names: string, nonce: Nonce): NearPromise;
    deleteKey(public_key: PublicKey): NearPromise;
    deleteAccount(beneficiary_id: AccountId): NearPromise;
    and(other: NearPromise): NearPromise;
    then(other: NearPromise): NearPromise;
    asReturn(): NearPromise;
    constructRecursively(): number | bigint;
    onReturn(): void;
}
export declare type PromiseOrValue<T> = NearPromise | T;
export {};
