export declare type Bytes = string;
export declare function u8ArrayToBytes(array: Uint8Array): string;
export declare function bytesToU8Array(bytes: Bytes): Uint8Array;
export declare function bytes(strOrU8Array: string | Uint8Array): Bytes;
export declare function assert(b: boolean, str: string): void;
export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export interface IntoStorageKey {
    into_storage_key(): Bytes;
}
export declare type Option<T> = T | null;
export declare function assertOneYocto(): void;
