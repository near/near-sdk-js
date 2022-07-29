import * as near from '../api'
import { Bytes, ClassMap } from '../utils';
import { Serializer } from 'superserial';

export class LookupSet<K> {
    readonly keyPrefix: Bytes;
    readonly serializer: Serializer;

    constructor(keyPrefix: Bytes, classes?: ClassMap) {
        this.keyPrefix = keyPrefix
        this.serializer = new Serializer({classes})
    }

    contains(key: K): boolean {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        return near.storageHasKey(storageKey)
    }
    
    // Returns true if the element was present in the set.
    remove(key: K): boolean {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        return near.storageRemove(storageKey)
    }

    // If the set did not have this value present, `true` is returned.
    // If the set did have this value present, `false` is returned.
    set(key: K): boolean {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        return !near.storageWrite(storageKey, '')
    }

    extend(keys: K[]) {
        for(let key of keys) {
            this.set(key)
        }
    }
}