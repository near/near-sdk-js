import { Bytes } from "../utils";
import { Vector } from "./vector";
export declare class UnorderedSet<T> {
    readonly prefix: Bytes;
    readonly elementIndexPrefix: Bytes;
    readonly elements: Vector<T>;
    constructor(prefix: Bytes);
    get length(): number;
    private set length(value);
    isEmpty(): boolean;
    contains(element: T): boolean;
    set(element: T): boolean;
    remove(element: T): boolean;
    clear(): void;
    toArray(): Bytes[];
    [Symbol.iterator](): import("./vector").VectorIterator;
    extend(elements: T[]): void;
    serialize(): string;
    static deserialize(data: UnorderedSet<unknown>): UnorderedSet<unknown>;
}
