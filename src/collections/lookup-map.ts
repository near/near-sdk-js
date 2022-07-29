import * as near from '../api'
import { Bytes } from '../utils';
import { Serializer } from 'superserial';

export class LookupMap<K, V> {
    readonly keyPrefix: Bytes;
    readonly serializer: Serializer;

    constructor(keyPrefix: Bytes, classes?: {
        [className: string]: ((new (...args: any[]) => any) | Function);
    }) {
        this.keyPrefix = keyPrefix
        this.serializer = new Serializer({classes})
    }

    containsKey(key: K): boolean {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        return near.storageHasKey(storageKey)
    }

    get(key: K): V | null {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        let raw = near.storageRead(storageKey)
        if (raw !== null) {
            return this.serializer.deserialize(raw)
        }
        return null
    }

    remove(key: K): V | null {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        if (near.storageRemove(storageKey)) {
            return this.serializer.deserialize(near.storageGetEvicted())
        }
        return null
    }

    set(key: K, value: V): V | null {
        let storageKey = this.keyPrefix + this.serializer.serialize(key)
        let storageValue = this.serializer.serialize(value)
        if (near.storageWrite(storageKey, storageValue)) {
            return this.serializer.deserialize(near.storageGetEvicted())
        }
        return null
    }

    extend(objects: [any, any][]) {
        for(let kv of objects) {
            this.set(kv[0], kv[1])
        }
    }
}