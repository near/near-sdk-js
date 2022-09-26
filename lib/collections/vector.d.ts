import { Bytes } from '../utils';
import { GetOptions } from '../types/collections';
export declare class Vector<DataType> {
    readonly prefix: Bytes;
    length: number;
    constructor(prefix: Bytes);
    isEmpty(): boolean;
    get(index: number, options?: GetOptions<DataType>): DataType | null;
    swapRemove(index: number, options?: GetOptions<DataType>): DataType | null;
    push(element: DataType): void;
    pop(options?: GetOptions<DataType>): DataType | null;
    replace(index: number, element: DataType, options?: GetOptions<DataType>): DataType;
    extend(elements: DataType[]): void;
    [Symbol.iterator](): VectorIterator<DataType>;
    private createIteratorWithOptions;
    toArray(options?: GetOptions<DataType>): DataType[];
    clear(): void;
    serialize(): string;
    static reconstruct<DataType>(data: Vector<DataType>): Vector<DataType>;
}
export declare class VectorIterator<DataType> {
    private vector;
    private readonly options?;
    private current;
    constructor(vector: Vector<DataType>, options?: GetOptions<DataType>);
    next(): {
        value: DataType | null;
        done: boolean;
    };
}
