import { GetOptions } from "../types/collections";
import { Bytes } from "../utils";
export declare class LookupSet<DataType> {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    contains(key: DataType, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    remove(key: DataType, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    set(key: DataType, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    extend(keys: DataType[], options?: Pick<GetOptions<DataType>, "serializer">): void;
    serialize(options?: Pick<GetOptions<DataType>, "serializer">): string;
    static reconstruct<DataType>(data: LookupSet<unknown>): LookupSet<DataType>;
}
