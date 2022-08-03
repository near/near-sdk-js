import { Bytes, ClassMap } from "../utils";
import { Vector } from "./vector";
import { Serializer } from 'superserial';
export declare class UnorderedMap<K, V> {
    readonly length: number;
    readonly keyIndexPrefix: Bytes;
    readonly keys: Vector<K>;
    readonly values: Vector<V>;
    readonly serializer: Serializer;
    constructor(prefix: Bytes, classes?: ClassMap);
    len(): number;
    isEmpty(): boolean;
    serializeIndex(index: number): Bytes;
    deserializeIndex(rawIndex: Bytes): number;
    getIndexRaw(key: K): Bytes;
    get(key: K): V | null;
    set(key: K, value: V): V | null;
    remove(key: K): V | null;
    clear(): void;
    toArray(): [K, V][];
    [Symbol.iterator](): UnorderedMapIterator<K, V>;
    extend(kvs: [K, V][]): void;
}
declare class UnorderedMapIterator<K, V> {
    private keys;
    private values;
    constructor(unorderedMap: UnorderedMap<K, V>);
    next(): {
        value: [K | null, V | null];
        done: boolean;
    };
}
export {};
