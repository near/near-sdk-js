import { GetOptions } from "./types/collections";
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
/**
 * Convert a Uint8Array to string, use Latin1 encoding
 * @param array - Uint8Array to convert
 * @returns result string
 */
export declare function u8ArrayToLatin1(array: Uint8Array): string;
/**
 * Convert a Latin1 string to Uint8Array
 * @param latin1 - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
export declare function latin1ToU8Array(latin1: string): Uint8Array;
/**
 * Alias to latin1ToU8Array
 */
/**
 * Alias to u8ArrayToLatin1
 */
export declare function str(a: Uint8Array): string;
/**
 * Concat two Uint8Array
 * @param array1
 * @param array2
 * @returns the concatenation of two array
 */
export declare function u8ArrayConcat(array1: Uint8Array, array2: Uint8Array): Uint8Array;
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
export declare function getValueWithOptions<DataType>(value: Uint8Array, options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
export declare function serializeValueWithOptions<DataType>(value: DataType, { serializer }?: Pick<GetOptions<DataType>, "serializer">): Uint8Array;
export declare function serialize(valueToSerialize: unknown): Uint8Array;
export declare function deserialize(valueToDeserialize: Uint8Array): unknown;
/**
 * Validates the Account ID according to the NEAR protocol
 * [Account ID rules](https://nomicon.io/DataStructures/Account#account-id-rules).
 *
 * @param accountId - The Account ID string you want to validate.
 */
export declare function validateAccountId(accountId: string): boolean;
export {};
