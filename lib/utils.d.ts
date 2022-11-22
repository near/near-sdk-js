import { GetOptions } from "./types/collections";
/**
 * A string containing byte characters. Can be safely used in NEAR calls.
 */
export declare type Bytes = string;
declare enum PromiseIndexBrand {
    _ = -1
}
/**
 * A PromiseIndex which represents the ID of a NEAR Promise.
 */
export declare type PromiseIndex = (number | bigint) & PromiseIndexBrand;
/**
 * A number that specifies the amount of NEAR in yoctoNEAR.
 */
export declare type NearAmount = number | bigint;
/**
 * A number that specifies the ID of a register in the NEAR WASM virtual machine.
 */
export declare type Register = number | bigint;
export declare const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
export declare const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
export declare function u8ArrayToBytes(array: Uint8Array): Bytes;
export declare function bytesToU8Array(bytes: Bytes): Uint8Array;
/**
 * Accepts a string or Uint8Array and either checks for the validity of the string or converts the Uint8Array to Bytes.
 *
 * @param stringOrU8Array - The string or Uint8Array to be checked/transformed
 * @returns Safe Bytes to be used in NEAR calls.
 */
export declare function bytes(stringOrU8Array: string | Uint8Array): Bytes;
/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
export declare function assert(expression: unknown, message: string): asserts expression;
export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare function getValueWithOptions<DataType>(value: string, options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
export declare function serializeValueWithOptions<DataType>(value: DataType, { serializer }?: Pick<GetOptions<DataType>, "serializer">): string;
export declare function serialize(valueToSerialize: unknown): string;
export declare function deserialize(valueToDeserialize: string): unknown;
/**
 * Validates the Account ID according to the NEAR protocol
 * [Account ID rules](https://nomicon.io/DataStructures/Account#account-id-rules).
 *
 * @param accountId - The Account ID string you want to validate.
 */
export declare function validateAccountId(accountId: string): boolean;
export declare function u8ArrayToLatin1(array: Uint8Array): string;
export {};
