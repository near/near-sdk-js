import { Bytes } from "../utils";
import { Vector } from "./vector";
export declare class UnorderedMap<DataType> {
    readonly prefix: Bytes;
    readonly keyIndexPrefix: Bytes;
    readonly keys: Vector<Bytes>;
    readonly values: Vector<DataType>;
    constructor(prefix: Bytes);
    get length(): number;
    private set length(value);
    isEmpty(): boolean;
    get(key: Bytes): DataType | null;
    set(key: Bytes, value: DataType): unknown | null;
    remove(key: Bytes): unknown | null;
    clear(): void;
    toArray(): [Bytes, DataType][];
    [Symbol.iterator](): UnorderedMapIterator<DataType>;
    extend(kvs: [Bytes, DataType][]): void;
    serialize(): string;
    static deserialize<DataType>(data: UnorderedMap<DataType>): UnorderedMap<DataType>;
}
declare class UnorderedMapIterator<DataType> {
    private keys;
    private values;
    constructor(unorderedMap: UnorderedMap<DataType>);
    next(): {
        value: [unknown | null, unknown | null];
        done: boolean;
    };
}
export {};
