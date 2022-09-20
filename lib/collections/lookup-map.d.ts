import { GetOptions } from "../types/collections";
import { Bytes } from "../utils";
export declare class LookupMap<DataType> {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    containsKey(key: Bytes): boolean;
    get(key: Bytes, options?: GetOptions<DataType>): DataType | null;
    remove(key: Bytes, options?: GetOptions<DataType>): DataType | null;
    set(key: Bytes, newValue: DataType, options?: GetOptions<DataType>): DataType | null;
    extend(keyValuePairs: [Bytes, DataType][], options?: GetOptions<DataType>): void;
    serialize(): string;
    static reconstruct<DataType>(data: LookupMap<unknown>): LookupMap<DataType>;
}
