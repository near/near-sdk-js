import { Bytes, ClassMap } from '../utils';
import { Serializer } from 'superserial';
export declare class LookupSet<K> {
    readonly keyPrefix: Bytes;
    readonly serializer: Serializer;
    constructor(keyPrefix: Bytes, classes?: ClassMap);
    contains(key: K): boolean;
    remove(key: K): boolean;
    set(key: K): boolean;
    extend(keys: K[]): void;
}
