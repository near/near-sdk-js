import { Bytes } from "../utils";
import { Vector } from "./vector";
export declare class UnorderedSet {
    readonly length: number;
    readonly prefix: Bytes;
    readonly elementIndexPrefix: Bytes;
    readonly elements: Vector;
    constructor(prefix: Bytes);
    len(): number;
    isEmpty(): boolean;
    private serializeIndex;
    private deserializeIndex;
    contains(element: unknown): boolean;
    set(element: unknown): boolean;
    remove(element: unknown): boolean;
    clear(): void;
    toArray(): Bytes[];
    [Symbol.iterator](): import("./vector").VectorIterator;
    extend(elements: unknown[]): void;
    serialize(): string;
    static deserialize(data: UnorderedSet): UnorderedSet;
}
