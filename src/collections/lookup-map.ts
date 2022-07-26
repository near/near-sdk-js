import * as near from '../api'
import { Bytes } from '../utils';
import { Serializer } from 'superserial';

export class LookupMap {
    readonly keyPrefix: Bytes;
    readonly serializer: Serializer;

    constructor(keyPrefix: Bytes, classes?: {
        [className: string]: ((new (...args: any[]) => any) | Function);
    }) {
        this.keyPrefix = keyPrefix
        this.serializer = new Serializer({classes})
    }

    containsKey(key: Bytes): boolean {
        let storageKey = this.keyPrefix + key
        return near.storageHasKey(storageKey)
    }

    containsObjectKey(key: any): boolean {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        return near.storageHasKey(storageKey)
    }

    get(key: Bytes): Bytes | null {
        let storageKey = this.keyPrefix + key
        return near.storageRead(storageKey)
    }

    getObject(key: any): any {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        let raw = near.storageRead(storageKey)
        if (raw !== null) {
            return this.serializer.deserialize(raw)
        }
        return null
    }

    remove(key: Bytes): Bytes | null {
        let storageKey = this.keyPrefix + key
        if (near.storageRemove(storageKey)) {
            return near.storageGetEvicted()
        }
        return null
    }

    removeObject(key: any): any {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        if (near.storageRemove(storageKey)) {
            return this.serializer.deserialize(near.storageGetEvicted())
        }
        return null
    }

    set(key: Bytes, value: Bytes): Bytes | null {
        let storageKey = this.keyPrefix + key
        if (near.storageWrite(storageKey, value)) {
            return near.storageGetEvicted()
        }
        return null
    }

    setObject(key: any, value: any): any {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        let storageValue = this.serializer.serialize(value)
        if (near.storageWrite(storageKey, storageValue)) {
            return this.serializer.deserialize(near.storageGetEvicted())
        }
        return null
    }

    extend(kvs: [Bytes, Bytes][]) {
        for(let kv of kvs) {
            this.set(kv[0], kv[1])
        }
    }

    extendObjects(objects: [any, any][]) {
        for(let kv of objects) {
            this.setObject(kv[0], kv[1])
        }
    }
}