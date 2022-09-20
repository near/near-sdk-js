import { Bytes } from "../utils";
export declare class LookupSet<DataType> {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    contains(key: DataType): boolean;
    remove(key: DataType): boolean;
    set(key: DataType): boolean;
    extend(keys: DataType[]): void;
    serialize(): string;
    static reconstruct<DataType>(data: LookupSet<unknown>): LookupSet<DataType>;
}
