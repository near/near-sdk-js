import { Bytes } from '../utils';
export declare class LookupMap {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    containsKey(key: Bytes): boolean;
    get(key: Bytes): unknown | null;
    remove(key: Bytes): unknown | null;
    set(key: Bytes, value: unknown): unknown | null;
    extend(objects: [Bytes, unknown][]): void;
    serialize(): string;
    static reconstruct(data: LookupMap): LookupMap;
}
