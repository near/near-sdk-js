import { Bytes } from "../utils";
import { Vector } from "./vector";
import { LookupMap } from "./lookup-map";
export declare class UnorderedMap {
    readonly prefix: Bytes;
    readonly keys: Vector;
    readonly values: LookupMap;
    constructor(prefix: Bytes);
    get length(): number;
    isEmpty(): boolean;
    get(key: Bytes): unknown | null;
    set(key: Bytes, value: unknown): unknown | null;
    remove(key: Bytes): unknown | null;
    clear(): void;
    toArray(): [Bytes, unknown][];
    [Symbol.iterator](): UnorderedMapIterator;
    extend(kvs: [Bytes, unknown][]): void;
    serialize(): string;
    static reconstruct(data: UnorderedMap): UnorderedMap;
}
declare class UnorderedMapIterator {
    private keys;
    private map;
    constructor(unorderedMap: UnorderedMap);
    next(): {
        value: [unknown | null, unknown | null];
        done: boolean;
    };
}
export {};
