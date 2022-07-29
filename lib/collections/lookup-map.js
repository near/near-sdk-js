import * as near from '../api';
import { Serializer } from 'superserial';
export class LookupMap {
    constructor(keyPrefix, classes) {
        this.keyPrefix = keyPrefix;
        this.serializer = new Serializer({ classes });
    }
    containsKey(key) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        return near.storageHasKey(storageKey);
    }
    get(key) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        let raw = near.storageRead(storageKey);
        if (raw !== null) {
            return this.serializer.deserialize(raw);
        }
        return null;
    }
    remove(key) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        if (near.storageRemove(storageKey)) {
            return this.serializer.deserialize(near.storageGetEvicted());
        }
        return null;
    }
    set(key, value) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        let storageValue = this.serializer.serialize(value);
        if (near.storageWrite(storageKey, storageValue)) {
            return this.serializer.deserialize(near.storageGetEvicted());
        }
        return null;
    }
    extend(objects) {
        for (let kv of objects) {
            this.set(kv[0], kv[1]);
        }
    }
}
