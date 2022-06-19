import { Vector } from "./vector";
export declare class UnorderedSet {
    readonly length: number;
    readonly elementIndexPrefix: string;
    readonly elements: Vector;
    constructor(prefix: any);
    len(): number;
    isEmpty(): boolean;
    serializeIndex(index: number): string;
    deserializeIndex(rawIndex: string): number;
    contains(element: string): boolean;
    set(element: string): boolean;
    remove(element: string): boolean;
    clear(): void;
    toArray(): string[];
    [Symbol.iterator](): import("./vector").VectorIterator;
    extend(elements: string[]): void;
}
