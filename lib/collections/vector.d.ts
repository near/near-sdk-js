import { Bytes } from "../utils";
export declare class Vector {
    length: number;
    readonly prefix: Bytes;
    constructor(prefix: Bytes);
    isEmpty(): boolean;
    get(index: number): unknown | null;
    swapRemove(index: number): unknown | null;
    push(element: unknown): void;
    pop(): unknown | null;
    replace(index: number, element: unknown): unknown;
    extend(elements: unknown[]): void;
    [Symbol.iterator](): VectorIterator;
    clear(): void;
    toArray(): unknown[];
    serialize(): string;
    static deserialize(data: Vector): Vector;
}
export declare class VectorIterator {
    private current;
    private vector;
    constructor(vector: Vector);
    next(): {
        value: unknown | null;
        done: boolean;
    };
}
