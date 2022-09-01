import * as near from '../api';
import { u8ArrayToLatin1 } from '../utils';
export class LookupMap {
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix;
    }
    containsKey(key) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        return near.storageHasKey(storageKey);
    }
    get(key) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        let raw = near.storageRead(storageKey);
        if (raw !== null) {
            return JSON.parse(u8ArrayToLatin1(raw));
        }
        return null;
    }
    remove(key) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        if (near.storageRemove(storageKey)) {
            return JSON.parse(u8ArrayToLatin1(near.storageGetEvicted()));
        }
        return null;
    }
    set(key, value) {
        let storageKey = this.keyPrefix + JSON.stringify(key);
        let storageValue = JSON.stringify(value);
        if (near.storageWrite(storageKey, storageValue)) {
            return JSON.parse(u8ArrayToLatin1(near.storageGetEvicted()));
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
    static deserialize(data) {
        return new LookupMap(data.keyPrefix);
    }
}
