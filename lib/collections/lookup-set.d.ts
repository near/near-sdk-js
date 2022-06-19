export declare class LookupSet {
    readonly keyPrefix: string;
    constructor(keyPrefix: string);
    contains(key: string): boolean;
    remove(key: string): any;
    set(key: string): any;
    extend(keys: string[]): void;
}
