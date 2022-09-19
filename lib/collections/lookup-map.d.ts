import { GetOptions } from "../types/collections";
import { Bytes } from "../utils";
export declare class LookupMap<DataType> {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    containsKey(key: Bytes): boolean;
    get(key: Bytes, options?: GetOptions<DataType>): DataType | null;
    remove(key: Bytes): DataType | null;
    set(key: Bytes, value: DataType): DataType | null;
    extend(objects: [Bytes, DataType][]): void;
    serialize(): string;
    static reconstruct<DataType>(data: LookupMap<DataType>): LookupMap<DataType>;
}
