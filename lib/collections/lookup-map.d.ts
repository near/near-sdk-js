import { Bytes } from '../utils';
export declare class LookupMap {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    containsKey(key: Bytes): boolean;
    get(key: Bytes): Bytes | null;
    remove(key: Bytes): Bytes | null;
    set(key: Bytes, value: Bytes): Bytes | null;
    extend(kvs: [Bytes, Bytes][]): void;
}
