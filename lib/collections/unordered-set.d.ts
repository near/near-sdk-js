import { Bytes } from "../utils";
import { Vector } from "./vector";
export declare class UnorderedSet<DataType> {
    readonly prefix: Bytes;
    readonly elementIndexPrefix: Bytes;
    readonly elements: Vector<DataType>;
    constructor(prefix: Bytes);
    get length(): number;
    private set length(value);
    isEmpty(): boolean;
    contains(element: DataType): boolean;
    set(element: DataType): boolean;
    remove(element: DataType): boolean;
    clear(): void;
    toArray(): Bytes[];
    [Symbol.iterator](): import("./vector").VectorIterator<DataType>;
    extend(elements: DataType[]): void;
    serialize(): string;
    static deserialize<DataType>(data: UnorderedSet<DataType>): UnorderedSet<DataType>;
}
