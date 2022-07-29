import { Bytes } from '../utils';
import { Serializer } from 'superserial';
export declare class LookupMap<K, V> {
    readonly keyPrefix: Bytes;
    readonly serializer: Serializer;
    constructor(keyPrefix: Bytes, classes?: {
        [className: string]: ((new (...args: any[]) => any) | Function);
    });
    containsKey(key: K): boolean;
    get(key: K): V | null;
    remove(key: K): V | null;
    set(key: K, value: V): V | null;
    extend(objects: [any, any][]): void;
}
