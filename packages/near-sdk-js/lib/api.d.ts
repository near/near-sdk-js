import { NearAmount, PromiseIndex } from "./utils";
import { GasWeight } from "./types";
/**
 * Logs parameters in the NEAR WASM virtual machine.
 *
 * @param params - Parameters to log.
 */
export declare function log(...params: unknown[]): void;
/**
 * Returns the account ID of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 */
export declare function signerAccountId(): string;
/**
 * Returns the public key of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 */
export declare function signerAccountPk(): Uint8Array;
/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 */
export declare function predecessorAccountId(): string;
/**
 * Returns the account ID of the current contract - the contract that is being executed.
 */
export declare function currentAccountId(): string;
/**
 * Returns the current block index.
 */
export declare function blockIndex(): bigint;
/**
 * Returns the current block height.
 */
export declare function blockHeight(): bigint;
/**
 * Returns the current block timestamp.
 */
export declare function blockTimestamp(): bigint;
/**
 * Returns the current epoch height.
 */
export declare function epochHeight(): bigint;
/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 */
export declare function attachedDeposit(): bigint;
/**
 * Returns the amount of Gas that was attached to this function call.
 */
export declare function prepaidGas(): bigint;
/**
 * Returns the amount of Gas that has been used by this function call until now.
 */
export declare function usedGas(): bigint;
/**
 * Returns the current account's account balance.
 */
export declare function accountBalance(): bigint;
/**
 * Returns the current account's locked balance.
 */
export declare function accountLockedBalance(): bigint;
/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
export declare function storageRead(key: Uint8Array): Uint8Array | null;
/**
 * Checks for the existance of a value under the provided key in NEAR storage.
 *
 * @param key - The key to check for in storage.
 */
export declare function storageHasKey(key: Uint8Array): boolean;
/**
 * Get the last written or removed value from NEAR storage.
 */
export declare function storageGetEvicted(): Uint8Array;
/**
 * Returns the current accounts NEAR storage usage.
 */
export declare function storageUsage(): bigint;
/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
export declare function storageWrite(key: Uint8Array, value: Uint8Array): boolean;
/**
 * Removes the value of the provided key from NEAR storage.
 *
 * @param key - The key to be removed.
 */
export declare function storageRemove(key: Uint8Array): boolean;
/**
 * Returns the cost of storing 0 Byte on NEAR storage.
 */
export declare function storageByteCost(): bigint;
/**
 * Returns the arguments passed to the current smart contract call.
 */
export declare function input(): Uint8Array;
/**
 * Returns the value from the NEAR WASM virtual machine.
 *
 * @param value - The value to return.
 */
export declare function valueReturn(value: Uint8Array): void;
/**
 * Returns a random string of bytes.
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
export declare function promiseCreate(accountId: string, methodName: string, args: Uint8Array, amount: NearAmount, gas: NearAmount): PromiseIndex;
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
export declare function promiseThen(promiseIndex: PromiseIndex, accountId: string, methodName: string, args: Uint8Array, amount: NearAmount, gas: NearAmount): PromiseIndex;
/**
 * Join an arbitrary array of NEAR promises.
 *
 * @param promiseIndexes - An arbitrary array of NEAR promise indexes to join.
 */
export declare function promiseAnd(...promiseIndexes: PromiseIndex[]): PromiseIndex;
/**
 * Create a NEAR promise which will have multiple promise actions inside.
 *
 * @param accountId - The account ID of the target contract.
 */
export declare function promiseBatchCreate(accountId: string): PromiseIndex;
/**
 * Attach a callback NEAR promise to a batch of NEAR promise actions.
 *
 * @param promiseIndex - The NEAR promise index of the batch.
 * @param accountId - The account ID of the target contract.
 */
export declare function promiseBatchThen(promiseIndex: PromiseIndex, accountId: string): PromiseIndex;
/**
 * Attach a create account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a create account action to.
 */
export declare function promiseBatchActionCreateAccount(promiseIndex: PromiseIndex): void;
/**
 * Attach a deploy contract promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a deploy contract action to.
 * @param code - The WASM byte code of the contract to be deployed.
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
export declare function promiseBatchActionFunctionCall(promiseIndex: PromiseIndex, methodName: string, args: Uint8Array, amount: NearAmount, gas: NearAmount): void;
/**
 * Attach a transfer promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a transfer action to.
 * @param amount - The amount of NEAR to transfer.
 */
export declare function promiseBatchActionTransfer(promiseIndex: PromiseIndex, amount: NearAmount): void;
/**
 * Attach a stake promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a stake action to.
 * @param amount - The amount of NEAR to stake.
 * @param publicKey - The public key with which to stake.
 */
export declare function promiseBatchActionStake(promiseIndex: PromiseIndex, amount: NearAmount, publicKey: Uint8Array): void;
/**
 * Attach a add full access key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a add full access key action to.
 * @param publicKey - The public key to add as a full access key.
 * @param nonce - The nonce to use.
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
 */
export declare function promiseBatchActionAddKeyWithFunctionCall(promiseIndex: PromiseIndex, publicKey: Uint8Array, nonce: number | bigint, allowance: NearAmount, receiverId: string, methodNames: string): void;
/**
 * Attach a delete key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete key action to.
 * @param publicKey - The public key to delete.
 */
export declare function promiseBatchActionDeleteKey(promiseIndex: PromiseIndex, publicKey: Uint8Array): void;
/**
 * Attach a delete account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete account action to.
 * @param beneficiaryId - The account ID of the beneficiary - the account that receives the remaining amount of NEAR.
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
export declare function promiseBatchActionFunctionCallWeight(promiseIndex: PromiseIndex, methodName: string, args: Uint8Array, amount: NearAmount, gas: NearAmount, weight: GasWeight): void;
/**
 * The number of promise results available.
 */
export declare function promiseResultsCount(): bigint;
/**
 * Returns the result of the NEAR promise for the passed promise index.
 *
 * @param promiseIndex - The index of the promise to return the result for.
 */
export declare function promiseResult(promiseIndex: PromiseIndex): Uint8Array;
/**
 * Executes the promise in the NEAR WASM virtual machine.
 *
 * @param promiseIndex - The index of the promise to execute.
 */
export declare function promiseReturn(promiseIndex: PromiseIndex): void;
/**
 * Returns sha256 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 */
export declare function sha256(value: Uint8Array): Uint8Array;
/**
 * Returns keccak256 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 */
export declare function keccak256(value: Uint8Array): Uint8Array;
/**
 * Returns keccak512 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 */
export declare function keccak512(value: Uint8Array): Uint8Array;
/**
 * Returns ripemd160 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
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
 * Returns the number of staked NEAR of given validator, in yoctoNEAR
 * @param accountId - validator's AccountID
 * @returns - staked amount
 */
export declare function validatorStake(accountId: string): bigint;
/**
 * Returns the number of staked NEAR of all validators, in yoctoNEAR
 * @returns total staked amount
 */
export declare function validatorTotalStake(): bigint;
/**
 * Computes multiexp on alt_bn128 curve using Pippenger's algorithm \sum_i
 * mul_i g_{1 i} should be equal result.
 *
 * @param value - equence of (g1:G1, fr:Fr), where
 * G1 is point (x:Fq, y:Fq) on alt_bn128,
 * alt_bn128 is Y^2 = X^3 + 3 curve over Fq.
 * `value` is encoded as packed, little-endian
 * `[((u256, u256), u256)]` slice.
 *
 * @returns multi exp sum
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
 */
export declare function altBn128PairingCheck(value: Uint8Array): boolean;
