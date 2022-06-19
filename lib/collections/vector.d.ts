export declare class Vector {
    length: number;
    readonly prefix: string;
    constructor(prefix: string);
    len(): number;
    isEmpty(): boolean;
    get(index: number): string | null;
    swapRemove(index: number): string | null;
    push(element: string): void;
    pop(): string | null;
    replace(index: number, element: string): string;
    extend(elements: string[]): void;
    [Symbol.iterator](): VectorIterator;
    clear(): void;
    toArray(): string[];
}
export declare class VectorIterator {
    private current;
    private vector;
    constructor(vector: Vector);
    next(): {
        value: string | null;
        done: boolean;
    };
}
