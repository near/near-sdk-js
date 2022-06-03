export class Vector {
    constructor(prefix: any);
    length: number;
    prefix: any;
    len(): number;
    isEmpty(): boolean;
    indexToKey(index: any): string;
    get(index: any): any;
    swapRemove(index: any): any;
    push(element: any): void;
    pop(): any;
    replace(index: any, element: any): any;
    extend(elements: any): void;
    clear(): void;
    toArray(): any[];
    [Symbol.iterator](): VectorIterator;
}
export class VectorIterator {
    constructor(vector: any);
    current: number;
    vector: any;
    next(): {
        value: any;
        done: boolean;
    };
}
