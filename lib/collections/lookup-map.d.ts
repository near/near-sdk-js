import { Bytes, ClassMap } from '../utils';
import { Serializer } from 'superserial';
export declare class LookupMap<K, V> {
    readonly keyPrefix: Bytes;
    readonly serializer: Serializer;
    constructor(keyPrefix: Bytes, classes?: ClassMap);
    containsKey(key: K): boolean;
    get(key: K): V | null;
    remove(key: K): V | null;
    set(key: K, value: V): V | null;
    extend(objects: [any, any][]): void;
}
