import { Vector } from "./vector";
export declare class UnorderedMap {
    readonly length: number;
    readonly keyIndexPrefix: string;
    readonly keys: Vector;
    readonly values: Vector;
    constructor(prefix: string);
    len(): number;
    isEmpty(): boolean;
    serializeIndex(index: number): string;
    deserializeIndex(rawIndex: string): number;
    getIndexRaw(key: string): string;
    get(key: string): string | null;
    set(key: string, value: string): string | null;
    remove(key: string): string | null;
    clear(): void;
    toArray(): [string, string][];
    [Symbol.iterator](): UnorderedMapIterator;
    extend(kvs: [string, string][]): void;
}
declare class UnorderedMapIterator {
    private keys;
    private values;
    constructor(unorderedMap: UnorderedMap);
    next(): {
        value: [string | null, string | null];
        done: boolean;
    };
}
export {};
