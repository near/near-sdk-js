import { Bytes } from '../utils';
export declare class LookupMap<DataType> {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    containsKey(key: Bytes): boolean;
    get(key: Bytes): DataType | null;
    remove(key: Bytes): DataType | null;
    set(key: Bytes, value: DataType): DataType | null;
    extend(objects: [Bytes, DataType][]): void;
    serialize(): string;
    static deserialize<DataType>(data: LookupMap<DataType>): LookupMap<DataType>;
}
