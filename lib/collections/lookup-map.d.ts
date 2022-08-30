import { Bytes } from "../utils";
export declare class LookupMap<T> {
    readonly keyPrefix: Bytes;
    constructor(keyPrefix: Bytes);
    containsKey(key: Bytes): boolean;
    get(key: Bytes): T | null;
    remove(key: Bytes): T | null;
    set(key: Bytes, value: T): T | null;
    extend(objects: [Bytes, T][]): void;
    serialize(): string;
    static deserialize(data: LookupMap<unknown>): LookupMap<unknown>;
}
