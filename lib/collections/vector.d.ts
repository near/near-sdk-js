import { Bytes, ClassMap } from "../utils";
import { Serializer } from 'superserial';
export declare class Vector<E> {
    length: number;
    readonly prefix: Bytes;
    readonly serializer: Serializer;
    constructor(prefix: Bytes, classes?: ClassMap);
    len(): number;
    isEmpty(): boolean;
    get(index: number): E | null;
    swapRemove(index: number): E | null;
    push(element: E): void;
    pop(): E | null;
    replace(index: number, element: E): E;
    extend(elements: E[]): void;
    [Symbol.iterator](): VectorIterator<E>;
    clear(): void;
    toArray(): E[];
}
export declare class VectorIterator<E> {
    private current;
    private vector;
    constructor(vector: Vector<E>);
    next(): {
        value: E | null;
        done: boolean;
    };
}
