import { Bytes } from "../utils";
export declare class Vector<T> {
    length: number;
    readonly prefix: Bytes;
    constructor(prefix: Bytes);
    isEmpty(): boolean;
    get(index: number): unknown | null;
    swapRemove(index: number): unknown | null;
    push(element: T): void;
    pop(): T | null;
    replace(index: number, element: T): T;
    extend(elements: T[]): void;
    [Symbol.iterator](): VectorIterator;
    clear(): void;
    toArray(): T[];
    serialize(): string;
    static deserialize(data: Vector<unknown>): Vector<unknown>;
}
export declare class VectorIterator {
    private current;
    private vector;
    constructor(vector: Vector<unknown>);
    next(): {
        value: unknown | null;
        done: boolean;
    };
}
