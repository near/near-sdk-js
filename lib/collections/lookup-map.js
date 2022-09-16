import * as near from '../api';
export class LookupMap {
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix;
    }
    containsKey(key) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        return near.storageHasKey(storageKey);
    }
    get(key, options) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        let raw = near.storageRead(storageKey);
        if (raw !== null) {
            const value = JSON.parse(raw);
            return !!options?.reconstructor ? options.reconstructor(value) : value;
        }
        return null;
    }
    remove(key) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        if (near.storageRemove(storageKey)) {
            return JSON.parse(near.storageGetEvicted());
        }
        return null;
    }
    set(key, value) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        let storageValue = JSON.stringify(value);
        if (near.storageWrite(storageKey, storageValue)) {
            return JSON.parse(near.storageGetEvicted());
        }
        return null;
    }
    extend(objects) {
        for (let kv of objects) {
            this.set(kv[0], kv[1]);
        }
    }
    serialize() {
        return JSON.stringify(this);
    }
    // converting plain object to class object
    static reconstruct(data) {
        return new LookupMap(data.keyPrefix);
    }
}
