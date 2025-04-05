/**
 * Blockchain-specific methods available to the smart contract.
 * @module near
 * */
import { NearAmount, PromiseIndex } from "./utils";
import { GasWeight } from "./types";
/**
 * Logs parameters in the NEAR WASM virtual machine.
 * This message is stored on chain.
 *
 * @param params - Parameters to log.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.log("hello world"); // -> "hello world"
 * near.log("key", 2024); // -> "key 2024"
 * near.log("user", { id: 1, name: "Test" }); // `user {"id": 1, "name": "Test"}`
 * near.log("text", undefined, "user", { id: 1, name: "Test" }); // `text undefined user {"id": 1, "name": "Test"}`
 * ```
 */
export declare function log(...params: unknown[]): void;
/**
 * Returns the account ID of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.signerAccountId(); // -> "test.near"
 * ```
 */
export declare function signerAccountId(): string;
/**
 * Returns the public key of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.signerAccountPk(); // -> [56, 91, 91, 85, 17, 172, 223, ...]
 * ```
 */
export declare function signerAccountPk(): Uint8Array;
/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.predecessorAccountId(); // -> "caller.near"
 * ```
 */
export declare function predecessorAccountId(): string;
/**
 * Returns the account ID of the current contract - the contract that is being executed.
 * The id of the account that owns the current contract.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.currentAccountId(); // -> "example.near"
 * ```
 */
export declare function currentAccountId(): string;
/**
 * Returns the current block index.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.blockIndex(); // -> bigint("681923959192")
 * ```
 */
export declare function blockIndex(): bigint;
/**
 * Returns the current block height.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.blockHeight(); // -> bigint("681923959192")
 * ```
 */
export declare function blockHeight(): bigint;
/**
 * Returns the current block timestamp, number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.blockTimestamp(); // -> bigint("1704124941241242141")
 * ```
 */
export declare function blockTimestamp(): bigint;
/**
 * Returns the current epoch height.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.epochHeight(); // -> bigint("185829414")
 * ```
 */
export declare function epochHeight(): bigint;
/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.attachedDeposit(); // -> bigint("210000000000000")
 * ```
 */
export declare function attachedDeposit(): bigint;
/**
 * Returns the amount of Gas that was attached to this function call.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.prepaidGas(); // -> bigint("30000000000000")
 * ```
 */
export declare function prepaidGas(): bigint;
/**
 * Returns the amount of Gas that has been used by this function call until now.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.usedGas(); // -> bigint("5003005000000")
 * ```
 */
export declare function usedGas(): bigint;
/**
 * Returns the current account's account balance. This includes the attached_deposit that was attached to the transaction.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.accountBalance(); // -> bigint("10500000210000000")
 * ```
 */
export declare function accountBalance(): bigint;
/**
 * Returns the current account's locked balance. The balance locked for potential validator staking.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.accountLockedBalance(); // -> bigint("10500000210000000")
 * ```
 */
export declare function accountLockedBalance(): bigint;
/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
export declare function storageReadRaw(key: Uint8Array): Uint8Array | null;
/**
 * Reads the utf-8 string value from NEAR storage that is stored under the provided key.
 *
 * @param key - The utf-8 string key to read from storage.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.storageRead("key"); // -> null
 * near.storageWrite("key", "value");
 * near.storageRead("key"); // -> "value"
 * ```
 */
export declare function storageRead(key: string): string | null;
/**
 * Checks for the existence of a value under the provided key in NEAR storage.
 *
 * @param key - The key to check for in storage.
 */
export declare function storageHasKeyRaw(key: Uint8Array): boolean;
/**
 * Checks for the existence of a value under the provided utf-8 string key in NEAR storage.
 *
 * @param key - The utf-8 string key to check for in storage.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.storageHasKey("key"); // -> false
 * near.storageWrite("key", "value");
 * near.storageHasKey("key"); // -> true
 * ```
 */
export declare function storageHasKey(key: string): boolean;
/**
 * Get the last written or removed value from NEAR storage.
 */
export declare function storageGetEvictedRaw(): Uint8Array;
/**
 * Get the last written or removed value from NEAR storage as utf-8 string.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.storageWrite("key", "value111");
 * near.storageGetEvicted(); // -> "value111"
 *
 * near.storageWrite("key2", "value222");
 * near.storageGetEvicted(); // -> "value222"
 *
 * near.storageRemove("key");
 * near.storageGetEvicted(); // -> "value111"
 * ```
 */
export declare function storageGetEvicted(): string;
/**
 * Returns the current accounts NEAR storage usage.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.storageUsage(); // -> bigint("73841284183493")
 * ```
 */
export declare function storageUsage(): bigint;
/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
export declare function storageWriteRaw(key: Uint8Array, value: Uint8Array): boolean;
/**
 * Writes the provided utf-8 string to NEAR storage under the provided key.
 *
 * @param key - The utf-8 string key under which to store the value.
 * @param value - The utf-8 string value to store.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.storageRead("key"); // -> null
 * near.storageWrite("key", "value");
 * near.storageRead("key"); // -> "value"
 * ```
 */
export declare function storageWrite(key: string, value: string): boolean;
/**
 * Removes the value of the provided key from NEAR storage.
 *
 * @param key - The key to be removed.
 */
export declare function storageRemoveRaw(key: Uint8Array): boolean;
/**
 * Removes the value of the provided utf-8 string key from NEAR storage.
 *
 * @param key - The utf-8 string key to be removed.
 *
 * @returns Removes the value stored under the given key. If key-value existed returns true, otherwise false.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.storageRemove("key"); // -> false
 * near.storageWrite("key", "value");
 * near.storageRemove("key"); // -> true
 * ```
 */
export declare function storageRemove(key: string): boolean;
/**
 * Returns the cost of storing 0 Byte on NEAR storage.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.storageByteCost(); // -> bigint("10000000000000000000")
 * ```
 */
export declare function storageByteCost(): bigint;
/**
 * Returns the arguments passed to the current smart contract call as bytes.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.inputRaw(); // -> Uint8Array([0, 128, 255, 15, ...])
 * ```
 */
export declare function inputRaw(): Uint8Array;
/**
 * Returns the arguments passed to the current smart contract call as utf-8 string.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.input(); // -> `{"key": "value"}`
 * ```
 */
export declare function input(): string;
/**
 * Returns the value from the NEAR WASM virtual machine.
 *
 * @param value - The value to return.
 */
export declare function valueReturnRaw(value: Uint8Array): void;
/**
 * Returns the utf-8 string value from the NEAR WASM virtual machine.
 * Sets the utf-8 string as the return value of this function.
 *
 * @param value - The utf-8 string value to return.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const user = {
 *  id: 128,
 *  name: "Test",
 *  key: "value"
 * };
 * near.valueReturn(JSON.stringify(user));
 * ```
 */
export declare function valueReturn(value: string): void;
/**
 * Returns a random string of bytes. This returns a 32 byte hash.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.randomSeed(); // -> [2, 4, 98, 124, 0, 224, ...]
 * ```
 */
export declare function randomSeed(): Uint8Array;
/**
 * Create a NEAR promise call to a contract on the blockchain.
 *
 * @param accountId - The account ID of the target contract.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR attached to the call.
 * @param gas - The amount of Gas attached to the call.
 */
export declare function promiseCreateRaw(accountId: string, methodName: string, args: Uint8Array, amount: NearAmount, gas: NearAmount): PromiseIndex;
/**
 * Create a NEAR promise call to a contract on the blockchain.
 *
 * @param accountId - The account ID of the target contract.
 * @param methodName - The name of the method to be called.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR attached to the call.
 * @param gas - The amount of Gas attached to the call.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseCreate(
 *  "contract.near",
 *  "increase",
 *  `{"value": 5}`,
 *  bigint("0"),
 *  bigint("30000000000000")
 * );
 * ```
 */
export declare function promiseCreate(accountId: string, methodName: string, args: string, amount: NearAmount, gas: NearAmount): PromiseIndex;
/**
 * Attach a callback NEAR promise to be executed after a provided promise.
 *
 * @param promiseIndex - The promise after which to call the callback.
 * @param accountId - The account ID of the contract to perform the callback on.
 * @param methodName - The name of the method to call.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
export declare function promiseThenRaw(promiseIndex: PromiseIndex, accountId: string, methodName: string, args: Uint8Array, amount: NearAmount, gas: NearAmount): PromiseIndex;
/**
 * Attach a callback NEAR promise to be executed after a provided promise.
 *
 * @param promiseIndex - The promise after which to call the callback.
 * @param accountId - The account ID of the contract to perform the callback on.
 * @param methodName - The name of the method to call.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseCreate(
 *  "contract.near",
 *  "increase",
 *  `{"value": 5}`,
 *  bigint("0"),
 *  bigint("30000000000000")
 * );
 *
 * const chainedPromise = near.promiseThen(
 *  promise,
 *  "contract2.near",
 *  "set_greeting",
 *  `{"text": "Hello, world!"}`,
 *  bigint("1000000000000"),
 *  bigint("30000000000000")
 * );
 * ```
 */
export declare function promiseThen(promiseIndex: PromiseIndex, accountId: string, methodName: string, args: string, amount: NearAmount, gas: NearAmount): PromiseIndex;
/**
 * Join an arbitrary array of NEAR promises.
 *
 * @param promiseIndexes - An arbitrary array of NEAR promise indexes to join.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise1 = near.promiseBatchCreate("receiver1.near");
 * near.promiseBatchActionTransfer(promise1, bigint("10000000000000000"));
 *
 * const promise2 = near.promiseBatchCreate("receiver2.near");
 * near.promiseBatchActionTransfer(promise2, bigint("30500050000000000"));
 *
 * const promise = near.promiseAnd(promise1, promise2);
 * ```
 */
export declare function promiseAnd(...promiseIndexes: PromiseIndex[]): PromiseIndex;
/**
 * Create a NEAR promise which will have multiple promise actions inside.
 *
 * @param accountId - The account ID of the target contract.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("receiver.near");
 * ```
 */
export declare function promiseBatchCreate(accountId: string): PromiseIndex;
/**
 * Attach a callback NEAR promise to a batch of NEAR promise actions.
 *
 * @param promiseIndex - The NEAR promise index of the batch.
 * @param accountId - The account ID of the target contract.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise1 = near.promiseBatchCreate("receiver1.near");
 * near.promiseBatchActionTransfer(promise1, bigint("10000000000000000"));
 *
 * const promise2 = near.promiseBatchThen(promise1, "receiver2.near");
 * near.promiseBatchActionTransfer(promise2, bigint("2500000000000000000"));
 * ```
 */
export declare function promiseBatchThen(promiseIndex: PromiseIndex, accountId: string): PromiseIndex;
/**
 * Attach a create account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a create account action to.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("receiver.near");
 *
 * near.promiseBatchActionCreateAccount(promise);
 * ```
 */
export declare function promiseBatchActionCreateAccount(promiseIndex: PromiseIndex): void;
/**
 * Attach a deploy contract promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a deploy contract action to.
 * @param code - The WASM byte code of the contract to be deployed.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("contract.near");
 *
 * near.promiseBatchActionDeployContract(promise, [21, 24, 9, 6, 53, 229, ...]);
 * ```
 */
export declare function promiseBatchActionDeployContract(promiseIndex: PromiseIndex, code: Uint8Array): void;
/**
 * Attach a function call promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call action to.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
export declare function promiseBatchActionFunctionCallRaw(promiseIndex: PromiseIndex, methodName: string, args: Uint8Array, amount: NearAmount, gas: NearAmount): void;
/**
 * Attach a function call promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call action to.
 * @param methodName - The name of the method to be called.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("counter.near");
 *
 * near.promiseBatchActionFunctionCall(
 *  promise,
 *  "increase",
 *  `{"value": 5}`,
 *  bigint("0"),
 *  bigint("30000000000000")
 * );
 * ```
 */
export declare function promiseBatchActionFunctionCall(promiseIndex: PromiseIndex, methodName: string, args: string, amount: NearAmount, gas: NearAmount): void;
/**
 * Attach a transfer promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a transfer action to.
 * @param amount - The amount of NEAR to transfer.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("receiver.near");
 * near.promiseBatchActionTransfer(promise, bigint("10000000000000000"));
 * ```
 */
export declare function promiseBatchActionTransfer(promiseIndex: PromiseIndex, amount: NearAmount): void;
/**
 * Attach a stake promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a stake action to.
 * @param amount - The amount of NEAR to stake.
 * @param publicKey - The public key with which to stake.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("contract.near");
 *
 * near.promiseBatchActionStake(
 *  promise,
 *  bigint("59319390502334010"),
 *  [2, 4, 59, 12, 48, 91, ...]
 * );
 * ```
 */
export declare function promiseBatchActionStake(promiseIndex: PromiseIndex, amount: NearAmount, publicKey: Uint8Array): void;
/**
 * Attach a add full access key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a add full access key action to.
 * @param publicKey - The public key to add as a full access key.
 * @param nonce - The nonce to use.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("receiver.near");
 *
 * near.promiseBatchActionCreateAccount(promise);
 *
 * near.promiseBatchActionAddKeyWithFullAccess(
 *  promise,
 *  [5, 11, 41, 58, 248, ...],
 *  572981
 * );
 * ```
 */
export declare function promiseBatchActionAddKeyWithFullAccess(promiseIndex: PromiseIndex, publicKey: Uint8Array, nonce: number | bigint): void;
/**
 * Attach a add access key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a add access key action to.
 * @param publicKey - The public key to add.
 * @param nonce - The nonce to use.
 * @param allowance - The allowance of the access key.
 * @param receiverId - The account ID of the receiver.
 * @param methodNames - The names of the method to allow the key for.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("receiver.near");
 *
 * near.promiseBatchActionCreateAccount(promise);
 *
 * near.promiseBatchActionAddKeyWithFunctionCall(
 *  promise,
 *  [5, 11, 41, 58, 248, ...],
 *  572981,
 *  bigint("25000000000000000000000"),
 *  "counter.near",
 *  "increase,decrease"
 * );
 * ```
 */
export declare function promiseBatchActionAddKeyWithFunctionCall(promiseIndex: PromiseIndex, publicKey: Uint8Array, nonce: number | bigint, allowance: NearAmount, receiverId: string, methodNames: string): void;
/**
 * Attach a delete key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete key action to.
 * @param publicKey - The public key to delete.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("receiver.near");
 *
 * near.promiseBatchActionDeleteKey(promise, [2, 4, 69, 26, 253, 129, ...]);
 * ```
 */
export declare function promiseBatchActionDeleteKey(promiseIndex: PromiseIndex, publicKey: Uint8Array): void;
/**
 * Attach a delete account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete account action to.
 * @param beneficiaryId - The account ID of the beneficiary - the account that receives the remaining amount of NEAR.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("receiver.near");
 *
 * near.promiseBatchActionDeleteAccount(promise, "beneficiary.near");
 * ```
 */
export declare function promiseBatchActionDeleteAccount(promiseIndex: PromiseIndex, beneficiaryId: string): void;
/**
 * Attach a function call with weight promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call with weight action to.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 * @param weight - The weight of unused Gas to use.
 */
export declare function promiseBatchActionFunctionCallWeightRaw(promiseIndex: PromiseIndex, methodName: string, args: Uint8Array, amount: NearAmount, gas: NearAmount, weight: GasWeight): void;
/**
 * Attach a function call with weight promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call with weight action to.
 * @param methodName - The name of the method to be called.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 * @param weight - The weight of unused Gas to use.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseBatchCreate("counter.near");
 *
 * near.promiseBatchActionFunctionCallWeight(
 *  promise,
 *  "increase",
 *  `{"value": 5}`,
 *  bigint("0"),
 *  bigint("30000000000000"),
 *  bigint("1")
 * );
 * ```
 */
export declare function promiseBatchActionFunctionCallWeight(promiseIndex: PromiseIndex, methodName: string, args: string, amount: NearAmount, gas: NearAmount, weight: GasWeight): void;
/**
 * The number of promise results available.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.promiseResultsCount(); // -> bigint("1")
 * ```
 */
export declare function promiseResultsCount(): bigint;
/**
 * Returns the result of the NEAR promise for the passed promise index.
 *
 * @param promiseIndex - The index of the promise to return the result for.
 */
export declare function promiseResultRaw(promiseIndex: PromiseIndex): Uint8Array;
/**
 * Returns the result of the NEAR promise for the passed promise index as utf-8 string
 *
 * @param promiseIndex - The index of the promise to return the result for.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.promiseResult(0); // -> `{"key": "value", "nested": {"key2": "value2"}}`
 * ```
 */
export declare function promiseResult(promiseIndex: PromiseIndex): string;
/**
 * Executes the promise in the NEAR WASM virtual machine.
 * Consider the execution result of promise under promiseIndex as execution result of this function.
 *
 * @param promiseIndex - The index of the promise to execute.
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * const promise = near.promiseCreate(
 *  "contract.near",
 *  "increase",
 *  `{"value": 5}`,
 *  bigint("0"),
 *  bigint("30000000000000")
 * );
 * near.promiseReturn(promise);
 * ```
 */
export declare function promiseReturn(promiseIndex: PromiseIndex): void;
/**
 * Returns sha256 hash of given value. This returns a 32 byte hash.
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.sha256([1, 4, 18, 31, 5, 91, 224]); // -> [0, 7, 18, 94, 228, 11, 15, ...]
 * ```
 */
export declare function sha256(value: Uint8Array): Uint8Array;
/**
 * Returns keccak256 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.keccak256([0, 24, 81, 31]); // -> [1, 3, 48, 94, 248, 11, 35, ...]
 * ```
 */
export declare function keccak256(value: Uint8Array): Uint8Array;
/**
 * Returns keccak512 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.keccak512([0, 24, 81, 31]); // -> [1, 3, 48, 94, 248, 11, 35, ...]
 * ```
 */
export declare function keccak512(value: Uint8Array): Uint8Array;
/**
 * Returns ripemd160 hash of given value. This returns a 20 byte hash.
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.ripemd160([5, 14, 51, 31, 15, 69]); // -> [2, 0, 0, 0, 18, 11, 65, ...]
 * ```
 */
export declare function ripemd160(value: Uint8Array): Uint8Array;
/**
 * Recovers an ECDSA signer address from a 32-byte message hash and a corresponding
 * signature along with v recovery byte. Takes in an additional flag to check for
 * malleability of the signature which is generally only ideal for transactions.
 *
 * @param hash - 32-byte message hash
 * @param sig - signature
 * @param v - number of recovery byte
 * @param malleabilityFlag - whether to check malleability
 * @returns 64 bytes representing the public key if the recovery was successful.
 */
export declare function ecrecover(hash: Uint8Array, sig: Uint8Array, v: number, malleabilityFlag: number): Uint8Array | null;
/**
 * Panic the transaction execution with given message
 * There's no way to panic with a utf-8 string, use "throw Error(msg)" for that
 *
 * @param msg - panic message in raw bytes, which should be a valid UTF-8 sequence
 */
export declare function panicUtf8(msg: Uint8Array): never;
/**
 * Log the message in transaction logs
 * @param msg - message in raw bytes, which should be a valid UTF-8 sequence
 */
export declare function logUtf8(msg: Uint8Array): void;
/**
 * Log the message in transaction logs
 * @param msg - message in raw bytes, which should be a valid UTF-16 sequence
 */
export declare function logUtf16(msg: Uint8Array): void;
/**
 * Returns the number of staked NEAR of given validator, in yoctoNEAR.
 * If the account is not a validator, returns 0.
 *
 * @param accountId - validator's AccountID
 * @returns - staked amount
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.validatorStake("non-validator.near"); // -> bigint("0")
 * near.validatorStake("validator.near"); // -> bigint("157201939492990")
 * ```
 */
export declare function validatorStake(accountId: string): bigint;
/**
 * Returns the number of staked NEAR of all validators, in yoctoNEAR, in the current epoch.
 * @returns total staked amount
 *
 * @example
 * ```ts
 * import { near } from "near-sdk-js";
 *
 * near.validatorTotalStake(); // -> bigint("412929490100000")
 * ```
 */
export declare function validatorTotalStake(): bigint;
/**
 * Computes multiexp on alt_bn128 curve using Pippenger's algorithm \sum_i
 * mul_i g_{1 i} should be equal result.
 *
 * @param value - sequence of (g1:G1, fr:Fr), where
 * G1 is point (x:Fq, y:Fq) on alt_bn128,
 * alt_bn128 is Y^2 = X^3 + 3 curve over Fq.
 * `value` is encoded as packed, little-endian
 * `[((u256, u256), u256)]` slice.
 *
 * @returns multi exp sum
 *
 * @see [EIP-196](https://eips.ethereum.org/EIPS/eip-196)
 */
export declare function altBn128G1Multiexp(value: Uint8Array): Uint8Array;
/**
 * Computes sum for signed g1 group elements on alt_bn128 curve \sum_i
 * (-1)^{sign_i} g_{1 i} should be equal result.
 *
 * @param value - sequence of (sign:bool, g1:G1), where
 * G1 is point (x:Fq, y:Fq) on alt_bn128,
 * alt_bn128 is Y^2 = X^3 + 3 curve over Fq.
 * value` is encoded a as packed, little-endian
 * `[((u256, u256), ((u256, u256), (u256, u256)))]` slice.
 *
 * @returns sum over Fq.
 *
 * @see [EIP-196](https://eips.ethereum.org/EIPS/eip-196)
 */
export declare function altBn128G1Sum(value: Uint8Array): Uint8Array;
/**
 * Computes pairing check on alt_bn128 curve.
 * \sum_i e(g_{1 i}, g_{2 i}) should be equal one (in additive notation), e(g1, g2) is Ate pairing
 *
 * @param value - sequence of (g1:G1, g2:G2), where
 * G2 is Fr-ordered subgroup point (x:Fq2, y:Fq2) on alt_bn128 twist,
 * alt_bn128 twist is Y^2 = X^3 + 3/(i+9) curve over Fq2
 * Fq2 is complex field element (re: Fq, im: Fq)
 * G1 is point (x:Fq, y:Fq) on alt_bn128,
 * alt_bn128 is Y^2 = X^3 + 3 curve over Fq
 * `value` is encoded a as packed, little-endian
 * `[((u256, u256), ((u256, u256), (u256, u256)))]` slice.
 *
 * @returns whether pairing check pass
 *
 * @see [EIP-197](https://eips.ethereum.org/EIPS/eip-197)
 */
export declare function altBn128PairingCheck(value: Uint8Array): boolean;
