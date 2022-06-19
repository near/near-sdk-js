export declare class LookupMap {
    readonly keyPrefix: string;
    constructor(keyPrefix: string);
    containsKey(key: string): boolean;
    get(key: string): string | null;
    remove(key: string): string | null;
    set(key: string, value: string): string | null;
    extend(kvs: [string, string][]): void;
}
