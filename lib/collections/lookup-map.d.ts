export declare class LookupMap {
    readonly keyPrefix: string;
    constructor(keyPrefix: string);
    containsKey(key: string): boolean;
    get(key: string): unknown | null;
    remove(key: string): unknown | null;
    set(key: string, value: unknown): unknown | null;
    extend(objects: [string, unknown][]): void;
    serialize(): string;
    static deserialize(data: LookupMap): LookupMap;
}
