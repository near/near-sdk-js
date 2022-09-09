import { Bytes } from "../utils";
import { Vector } from "./vector";
import { LookupMap } from "./lookup-map";
import { GetOptions } from "../types/collections";
declare type ValueAndIndex<DataType> = [value: DataType, index: number];
export declare class UnorderedMap<DataType> {
    readonly prefix: Bytes;
    readonly keys: Vector<Bytes>;
    readonly values: LookupMap<ValueAndIndex<DataType>>;
    constructor(prefix: Bytes);
    get length(): number;
    isEmpty(): boolean;
    get(key: Bytes, options?: GetOptions<DataType>): DataType | null;
    set(key: Bytes, value: DataType): DataType | null;
    remove(key: Bytes): DataType | null;
    clear(): void;
    toArray(): [Bytes, DataType][];
    [Symbol.iterator](): UnorderedMapIterator<DataType>;
    extend(kvs: [Bytes, DataType][]): void;
    serialize(): string;
    static deserialize<DataType>(data: UnorderedMap<DataType>): UnorderedMap<DataType>;
}
declare class UnorderedMapIterator<DataType> {
    private keys;
    private map;
    constructor(unorderedMap: UnorderedMap<DataType>);
    next(): {
        value: [unknown | null, unknown | null];
        done: boolean;
    };
}
export {};
