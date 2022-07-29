import { Bytes } from '../utils';
export declare class LookupMap<V> {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    insert(key: Bytes, value: V): Bytes | null;
    containsKey(key: Bytes): boolean;
    get(key: Bytes): V | null;
    remove(key: Bytes): Bytes | null;
}
