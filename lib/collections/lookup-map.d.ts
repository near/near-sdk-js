export class LookupMap {
    constructor(keyPrefix: any);
    keyPrefix: any;
    containsKey(key: any): boolean;
    get(key: any): any;
    remove(key: any): any;
    set(key: any, value: any): any;
    extend(kvs: any): void;
}
