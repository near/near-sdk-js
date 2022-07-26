import { Bytes } from '../utils';
import { Serializer } from 'superserial';
export declare class LookupMap {
    readonly keyPrefix: Bytes;
    readonly serializer: Serializer;
    constructor(keyPrefix: Bytes, classes?: {
        [className: string]: ((new (...args: any[]) => any) | Function);
    });
    containsKey(key: Bytes): boolean;
    containsObjectKey(key: any): boolean;
    get(key: Bytes): Bytes | null;
    getObject(key: any): any;
    remove(key: Bytes): Bytes | null;
    removeObject(key: any): any;
    set(key: Bytes, value: Bytes): Bytes | null;
    setObject(key: any, value: any): any;
    extend(kvs: [Bytes, Bytes][]): void;
    extendObjects(objects: [any, any][]): void;
}
