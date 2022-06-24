import * as near from '../api';
export class LookupSet {
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix;
    }
    contains(key) {
        let storageKey = this.keyPrefix + key;
        return near.storageHasKey(storageKey);
    }
    remove(key) {
        let storageKey = this.keyPrefix + key;
        if (near.storageRemove(storageKey)) {
            return near.storageGetEvicted();
        }
        return null;
    }
    set(key) {
        let storageKey = this.keyPrefix + key;
        if (near.storageWrite(storageKey, '')) {
            return near.storageGetEvicted();
        }
        return null;
    }
    extend(keys) {
        for (let key of keys) {
            this.set(key);
        }
    }
}
