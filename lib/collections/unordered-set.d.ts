export class UnorderedSet {
    constructor(prefix: any);
    length: number;
    elementIndexPrefix: string;
    elements: Vector;
    len(): number;
    isEmpty(): boolean;
    serializeIndex(index: any): string;
    deserializeIndex(rawIndex: any): number;
    contains(element: any): boolean;
    set(element: any): boolean;
    remove(element: any): boolean;
    clear(): void;
    toArray(): string[];
    extend(elements: any): void;
    [Symbol.iterator](): import("./vector").VectorIterator;
}
import { Vector } from "./vector";
