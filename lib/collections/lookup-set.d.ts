export class LookupSet {
    constructor(keyPrefix: any);
    keyPrefix: any;
    contains(key: any): boolean;
    remove(key: any): any;
    set(key: any): any;
    extend(keys: any): void;
}
