export declare type Bytes = Uint8Array | string;
export declare function bytesToU8Array(bytes: Bytes): Uint8Array;
export declare function u8ArrayToLatin1(array: Uint8Array): string;
export declare function latin1ToU8Array(latin1: string): Uint8Array;
export declare function u8ArrayConcat(array1: Uint8Array, array2: Uint8Array): Uint8Array;
export declare function assert(b: boolean, str: string): void;
export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
