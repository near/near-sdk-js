import { Bytes, ClassMap } from "../utils";
import { Vector } from "./vector";
import { Serializer } from 'superserial';
export declare class UnorderedSet<E> {
    readonly length: number;
    readonly elementIndexPrefix: Bytes;
    readonly elements: Vector<E>;
    readonly serializer: Serializer;
    constructor(prefix: Bytes, classes?: ClassMap);
    len(): number;
    isEmpty(): boolean;
    serializeIndex(index: number): string;
    deserializeIndex(rawIndex: Bytes): number;
    contains(element: E): boolean;
    set(element: E): boolean;
    remove(element: E): boolean;
    clear(): void;
    toArray(): Bytes[];
    [Symbol.iterator](): import("./vector").VectorIterator<E>;
    extend(elements: E[]): void;
}
