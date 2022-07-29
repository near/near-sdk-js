import * as near from '../api';
export class LookupMap {
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix;
    }
    insert(key, value) {
        const storageKey = this.keyPrefix + key;
        if (near.storageWrite(storageKey, JSON.stringify(value))) {
            return near.storageGetEvicted();
        }
        return null;
    }
    containsKey(key) {
        const storageKey = this.keyPrefix + key;
        return near.storageHasKey(storageKey);
    }
    get(key) {
        const storageKey = this.keyPrefix + key;
        return JSON.parse(near.storageRead(storageKey));
    }
    remove(key) {
        const storageKey = this.keyPrefix + key;
        if (near.storageRemove(storageKey)) {
            return near.storageGetEvicted();
        }
        return null;
    }
}
