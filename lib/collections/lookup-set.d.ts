export declare class LookupSet {
    readonly keyPrefix: string;
    constructor(keyPrefix: string);
    contains(key: string): boolean;
    remove(key: string): string;
    set(key: string): string;
    extend(keys: string[]): void;
}
