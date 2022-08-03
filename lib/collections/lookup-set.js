import * as near from '../api';
import { Serializer } from 'superserial';
export class LookupSet {
    constructor(keyPrefix, classes) {
        this.keyPrefix = keyPrefix;
        this.serializer = new Serializer({ classes });
    }
    contains(key) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        return near.storageHasKey(storageKey);
    }
    // Returns true if the element was present in the set.
    remove(key) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        return near.storageRemove(storageKey);
    }
    // If the set did not have this value present, `true` is returned.
    // If the set did have this value present, `false` is returned.
    set(key) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        return !near.storageWrite(storageKey, '');
    }
    extend(keys) {
        for (let key of keys) {
            this.set(key);
        }
    }
}
