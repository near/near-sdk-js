import { Bytes } from "../utils";
import { Vector } from "./vector";
export declare class UnorderedSet {
    readonly length: number;
    readonly elementIndexPrefix: Bytes;
    readonly elements: Vector;
    constructor(prefix: Bytes);
    len(): number;
    isEmpty(): boolean;
    serializeIndex(index: number): string;
    deserializeIndex(rawIndex: Bytes): number;
    contains(element: Bytes): boolean;
    set(element: Bytes): boolean;
    remove(element: Bytes): boolean;
    clear(): void;
    toArray(): Bytes[];
    [Symbol.iterator](): import("./vector").VectorIterator;
    extend(elements: Bytes[]): void;
}
