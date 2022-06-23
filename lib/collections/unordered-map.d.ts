import { Bytes } from "../utils";
import { Vector } from "./vector";
export declare class UnorderedMap {
    readonly length: number;
    readonly keyIndexPrefix: Bytes;
    readonly keys: Vector;
    readonly values: Vector;
    constructor(prefix: Bytes);
    len(): number;
    isEmpty(): boolean;
    serializeIndex(index: number): Bytes;
    deserializeIndex(rawIndex: Bytes): number;
    getIndexRaw(key: Bytes): Bytes;
    get(key: Bytes): Bytes | null;
    set(key: Bytes, value: Bytes): Bytes | null;
    remove(key: Bytes): Bytes | null;
    clear(): void;
    toArray(): [Bytes, Bytes][];
    [Symbol.iterator](): UnorderedMapIterator;
    extend(kvs: [Bytes, Bytes][]): void;
}
declare class UnorderedMapIterator {
    private keys;
    private values;
    constructor(unorderedMap: UnorderedMap);
    next(): {
        value: [Bytes | null, Bytes | null];
        done: boolean;
    };
}
export {};
