import { GetOptions } from "./types/collections";
export declare type Bytes = string;
export declare type PromiseIndex = number | bigint;
export declare type NearAmount = number | bigint;
export declare type Register = number | bigint;
export declare function u8ArrayToBytes(array: Uint8Array): Bytes;
export declare function bytesToU8Array(bytes: Bytes): Uint8Array;
export declare function bytes(stringOrU8Array: string | Uint8Array): Bytes;
export declare function assert(expression: boolean, message: string): void;
export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare function getValueWithOptions<DataType>(value: unknown, options?: GetOptions<DataType>): DataType | null;
export declare function serialize(valueToSerialize: unknown): string;
export declare function deserialize(valueToDeserialize: string): unknown;
