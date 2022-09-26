import { Bytes } from '../utils';
import { Vector } from './vector';
import { LookupMap } from './lookup-map';
import { GetOptions } from '../types/collections';
declare type ValueAndIndex<DataType> = [value: DataType, index: number];
export declare class UnorderedMap<DataType> {
    readonly prefix: Bytes;
    readonly keys: Vector<Bytes>;
    readonly values: LookupMap<ValueAndIndex<DataType>>;
    constructor(prefix: Bytes);
    get length(): number;
    isEmpty(): boolean;
    get(key: Bytes, options?: GetOptions<DataType>): DataType | null;
    set(key: Bytes, value: DataType, options?: GetOptions<DataType>): DataType | null;
    remove(key: Bytes, options?: GetOptions<DataType>): DataType | null;
    clear(): void;
    [Symbol.iterator](): UnorderedMapIterator<DataType>;
    private createIteratorWithOptions;
    toArray(options?: GetOptions<DataType>): [Bytes, DataType][];
    extend(keyValuePairs: [Bytes, DataType][]): void;
    serialize(): string;
    static reconstruct<DataType>(data: UnorderedMap<DataType>): UnorderedMap<DataType>;
}
declare class UnorderedMapIterator<DataType> {
    private options?;
    private keys;
    private map;
    constructor(unorderedMap: UnorderedMap<DataType>, options?: GetOptions<DataType>);
    next(): {
        value: [unknown | null, unknown | null];
        done: boolean;
    };
}
export {};
