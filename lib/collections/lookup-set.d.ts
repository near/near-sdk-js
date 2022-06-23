import { Bytes } from '../utils';
export declare class LookupSet {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    contains(key: Bytes): boolean;
    remove(key: Bytes): string;
    set(key: Bytes): string;
    extend(keys: Bytes[]): void;
}
