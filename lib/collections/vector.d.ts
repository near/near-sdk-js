import { Bytes } from "../utils";
export declare class Vector {
    length: number;
    readonly prefix: Bytes;
    constructor(prefix: Bytes);
    len(): number;
    isEmpty(): boolean;
    get(index: number): Bytes | null;
    swapRemove(index: number): Bytes | null;
    push(element: Bytes): void;
    pop(): Bytes | null;
    replace(index: number, element: Bytes): Bytes;
    extend(elements: Bytes[]): void;
    [Symbol.iterator](): VectorIterator;
    clear(): void;
    toArray(): Bytes[];
}
export declare class VectorIterator {
    private current;
    private vector;
    constructor(vector: Vector);
    next(): {
        value: Bytes | null;
        done: boolean;
    };
}
