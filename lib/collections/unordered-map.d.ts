export class UnorderedMap {
    constructor(prefix: any);
    length: number;
    keyIndexPrefix: string;
    keys: Vector;
    values: Vector;
    len(): number;
    isEmpty(): boolean;
    serializeIndex(index: any): string;
    deserializeIndex(rawIndex: any): number;
    getIndexRaw(key: any): any;
    get(key: any): any;
    set(key: any, value: any): any;
    remove(key: any): any;
    clear(): void;
    toArray(): any[][];
    extend(kvs: any): void;
    [Symbol.iterator](): UnorderedMapIterator;
}
import { Vector } from "./vector";
declare class UnorderedMapIterator {
    constructor(unorderedMap: any);
    keys: VectorIterator;
    values: VectorIterator;
    next(): {
        value: any[];
        done: boolean;
    };
}
import { VectorIterator } from "./vector";
export {};
