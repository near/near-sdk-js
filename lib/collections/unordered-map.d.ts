import { Bytes } from "../utils";
import { Vector } from "./vector";
export declare class UnorderedMap<T> {
    readonly prefix: Bytes;
    readonly keyIndexPrefix: Bytes;
    readonly keys: Vector<Bytes>;
    readonly values: Vector<T>;
    constructor(prefix: Bytes);
    get length(): number;
    private set length(value);
    isEmpty(): boolean;
    get(key: Bytes): T | null;
    set(key: Bytes, value: T): unknown | null;
    remove(key: Bytes): unknown | null;
    clear(): void;
    toArray(): [Bytes, T][];
    [Symbol.iterator](): UnorderedMapIterator<T>;
    extend(kvs: [Bytes, T][]): void;
    serialize(): string;
    static deserialize(data: UnorderedMap<unknown>): UnorderedMap<unknown>;
}
declare class UnorderedMapIterator<T> {
    private keys;
    private values;
    constructor(unorderedMap: UnorderedMap<T>);
    next(): {
        value: [unknown | null, unknown | null];
        done: boolean;
    };
}
export {};
