import { Bytes } from "../utils";
import { GetOptions } from "../types/collections";
export declare class Vector<DataType> {
    length: number;
    readonly prefix: Bytes;
    constructor(prefix: Bytes);
    isEmpty(): boolean;
    get(index: number, options?: GetOptions<DataType>): DataType | null;
    swapRemove(index: number): unknown | null;
    push(element: DataType): void;
    pop(): DataType | null;
    replace(index: number, element: DataType): DataType;
    extend(elements: DataType[]): void;
    [Symbol.iterator](): VectorIterator<DataType>;
    clear(): void;
    toArray(): DataType[];
    serialize(): string;
    static reconstruct<DataType>(data: Vector<DataType>): Vector<DataType>;
}
export declare class VectorIterator<DataType> {
    private current;
    private vector;
    constructor(vector: Vector<DataType>);
    next(): {
        value: unknown | null;
        done: boolean;
    };
}
