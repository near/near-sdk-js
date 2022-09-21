import { GetOptions } from "./types/collections";
export declare type Bytes = string;
export declare type PromiseIndex = number | bigint;
export declare type NearAmount = number | bigint;
export declare type Register = number | bigint;
export declare const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
export declare const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
export declare function u8ArrayToBytes(array: Uint8Array): Bytes;
export declare function bytesToU8Array(bytes: Bytes): Uint8Array;
export declare function bytes(stringOrU8Array: string | Uint8Array): Bytes;
export declare function assert(expression: boolean, message: string): void;
export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare function getValueWithOptions<DataType>(value: string, options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
export declare function serializeValueWithOptions<DataType>(value: DataType, { serializer }?: Pick<GetOptions<DataType>, "serializer">): string;
export declare function serialize(valueToSerialize: unknown): string;
export declare function deserialize(valueToDeserialize: string): unknown;
