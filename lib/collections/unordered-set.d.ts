import { Bytes } from "../utils";
import { Vector, VectorIterator } from "./vector";
import { GetOptions } from "../types/collections";
export declare class UnorderedSet<DataType> {
    readonly prefix: Bytes;
    readonly elementIndexPrefix: Bytes;
    readonly elements: Vector<DataType>;
    constructor(prefix: Bytes);
    get length(): number;
    isEmpty(): boolean;
    contains(element: DataType, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    set(element: DataType, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    remove(element: DataType, options?: GetOptions<DataType>): boolean;
    clear(options?: Pick<GetOptions<DataType>, "serializer">): void;
    [Symbol.iterator](): VectorIterator<DataType>;
    private createIteratorWithOptions;
    toArray(options?: GetOptions<DataType>): DataType[];
    extend(elements: DataType[]): void;
    serialize(options?: Pick<GetOptions<DataType>, "serializer">): string;
    static reconstruct<DataType>(data: UnorderedSet<DataType>): UnorderedSet<DataType>;
}
