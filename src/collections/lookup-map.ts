import * as near from '../api'
import { Bytes } from '../utils';

export class LookupMap<V> {
    readonly keyPrefix: Bytes;

    constructor(keyPrefix: Bytes) {
        this.keyPrefix = keyPrefix
    }

    insert(key: Bytes, value: V): Bytes | null {
        const storageKey = this.keyPrefix + key
        if (near.storageWrite(storageKey, JSON.stringify(value))) {
            return near.storageGetEvicted()
        }
        return null
    }

    containsKey(key: Bytes): boolean {
        const storageKey = this.keyPrefix + key
        return near.storageHasKey(storageKey)
    }

    get(key: Bytes): V | null {
        const storageKey = this.keyPrefix + key
        return JSON.parse(near.storageRead(storageKey)) as V
    }

    remove(key: Bytes): Bytes | null {
        const storageKey = this.keyPrefix + key
        if (near.storageRemove(storageKey)) {
            return near.storageGetEvicted()
        }
        return null
    }

}