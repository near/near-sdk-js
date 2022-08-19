import { Bytes } from "../utils";
import { Vector } from "./vector";
export declare class UnorderedMap {
    readonly prefix: Bytes;
    readonly keyIndexPrefix: Bytes;
    readonly keys: Vector;
    readonly values: Vector;
    constructor(prefix: Bytes);
    get length(): number;
    private set length(value);
    isEmpty(): boolean;
    get(key: Bytes): unknown | null;
    set(key: Bytes, value: unknown): unknown | null;
    remove(key: Bytes): unknown | null;
    clear(): void;
    toArray(): [Bytes, unknown][];
    [Symbol.iterator](): UnorderedMapIterator;
    extend(kvs: [Bytes, unknown][]): void;
    serialize(): string;
    static deserialize(data: UnorderedMap): UnorderedMap;
}
declare class UnorderedMapIterator {
    private keys;
    private values;
    constructor(unorderedMap: UnorderedMap);
    next(): {
        value: [unknown | null, unknown | null];
        done: boolean;
    };
}
export {};
