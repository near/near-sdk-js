import * as near from '../api';
import { Serializer } from 'superserial';
export class LookupMap {
    constructor(keyPrefix, classes) {
        this.keyPrefix = keyPrefix;
        this.serializer = new Serializer({ classes });
    }
    containsKey(key) {
        let storageKey = this.keyPrefix + key;
        return near.storageHasKey(storageKey);
    }
    containsObjectKey(key) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        return near.storageHasKey(storageKey);
    }
    get(key) {
        let storageKey = this.keyPrefix + key;
        return near.storageRead(storageKey);
    }
    getObject(key) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        let raw = near.storageRead(storageKey);
        if (raw !== null) {
            return this.serializer.deserialize(raw);
        }
        return null;
    }
    remove(key) {
        let storageKey = this.keyPrefix + key;
        if (near.storageRemove(storageKey)) {
            return near.storageGetEvicted();
        }
        return null;
    }
    removeObject(key) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        if (near.storageRemove(storageKey)) {
            return this.serializer.deserialize(near.storageGetEvicted());
        }
        return null;
    }
    set(key, value) {
        let storageKey = this.keyPrefix + key;
        if (near.storageWrite(storageKey, value)) {
            return near.storageGetEvicted();
        }
        return null;
    }
    setObject(key, value) {
        let storageKey = this.keyPrefix + this.serializer.serialize(key);
        let storageValue = this.serializer.serialize(value);
        if (near.storageWrite(storageKey, storageValue)) {
            return this.serializer.deserialize(near.storageGetEvicted());
        }
        return null;
    }
    extend(kvs) {
        for (let kv of kvs) {
            this.set(kv[0], kv[1]);
        }
    }
    extendObjects(objects) {
        for (let kv of objects) {
            this.setObject(kv[0], kv[1]);
        }
    }
}
