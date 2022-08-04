import { Bytes } from '../utils';
export declare class LookupSet {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    contains(key: Bytes): boolean;
    remove(key: Bytes): boolean;
    set(key: Bytes): boolean;
    extend(keys: Bytes[]): void;
}
