import { GetOptions } from './types/collections';
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
export interface IntoStorageKey {
    into_storage_key(): Bytes;
}
export declare type Option<T> = T | null;
export declare function assertOneYocto(): void;
export declare function getValueWithOptions<DataType>(value: unknown, options?: GetOptions<DataType>): DataType | null;
