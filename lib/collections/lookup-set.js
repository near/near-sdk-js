import * as near from '../api';
export class LookupSet {
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix;
    }
    contains(key) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        return near.storageHasKey(storageKey);
    }
    // Returns true if the element was present in the set.
    remove(key) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        return near.storageRemove(storageKey);
    }
    // If the set did not have this value present, `true` is returned.
    // If the set did have this value present, `false` is returned.
    set(key) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        return !near.storageWrite(storageKey, '');
    }
    extend(keys) {
        for (let key of keys) {
            this.set(key);
        }
    }
    serialize() {
        return JSON.stringify(this);
    }
    // converting plain object to class object
    static deserialize(data) {
        return new LookupSet(data.keyPrefix);
    }
}
