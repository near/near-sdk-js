import { GetOptions } from "./types/collections";
export interface Env {
    uint8array_to_latin1_string(a: Uint8Array): string;
    uint8array_to_utf8_string(a: Uint8Array): string;
    latin1_string_to_uint8array(s: string): Uint8Array;
    utf8_string_to_uint8array(s: string): Uint8Array;
}
/**
 * A PromiseIndex which represents the ID of a NEAR Promise.
 */
export declare type PromiseIndex = number | bigint;
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
 * Concat two Uint8Array
 * @param array1
 * @param array2
 * @returns the concatenation of two array
 */
export declare function concat(array1: Uint8Array, array2: Uint8Array): Uint8Array;
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
export declare function getValueWithOptions<DataType>(subDatatype: unknown, value: Uint8Array | null, options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
export declare function serializeValueWithOptions<DataType>(value: DataType, { serializer }?: Pick<GetOptions<DataType>, "serializer">): Uint8Array;
export declare function serialize(valueToSerialize: unknown): Uint8Array;
export declare function deserialize(valueToDeserialize: Uint8Array): unknown;
export declare function decodeObj2class(class_instance: any, obj: any): any;
/**
 * Validates the Account ID according to the NEAR protocol
 * [Account ID rules](https://nomicon.io/DataStructures/Account#account-id-rules).
 *
 * @param accountId - The Account ID string you want to validate.
 */
export declare function validateAccountId(accountId: string): boolean;
/**
 * A subset of NodeJS TextEncoder API
 */
export declare class TextEncoder {
    encode(s: string): Uint8Array;
}
/**
 * A subset of NodeJS TextDecoder API. Only support utf-8 and latin1 encoding.
 */
export declare class TextDecoder {
    encoding: string;
    constructor(encoding?: string);
    decode(a: Uint8Array): string;
}
/**
 * Convert a string to Uint8Array, each character must have a char code between 0-255.
 * @param s - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
export declare function bytes(s: string): Uint8Array;
/**
 * Convert a Uint8Array to string, each uint8 to the single character of that char code
 * @param a - Uint8Array to convert
 * @returns result string
 */
export declare function str(a: Uint8Array): string;
/**
 * Encode the string to Uint8Array with UTF-8 encoding
 * @param s - String to encode
 * @returns result Uint8Array
 */
export declare function encode(s: string): Uint8Array;
/**
 * Decode the Uint8Array to string in UTF-8 encoding
 * @param a - array to decode
 * @returns result string
 */
export declare function decode(a: Uint8Array): string;
/**
 * When implemented, allow object to be stored as collection key
 */
export interface IntoStorageKey {
    into_storage_key(): string;
}
