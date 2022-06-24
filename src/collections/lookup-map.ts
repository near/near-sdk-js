import * as near from '../api'
import { Bytes } from '../utils';

export class LookupMap {
    readonly keyPrefix: Bytes;

    constructor(keyPrefix: Bytes) {
        this.keyPrefix = keyPrefix
    }

    containsKey(key: Bytes): boolean {
        let storageKey = this.keyPrefix + key
        return near.storageHasKey(storageKey)
    }

    get(key: Bytes): Bytes | null {
        let storageKey = this.keyPrefix + key
        return near.storageRead(storageKey)
    }

    remove(key: Bytes): Bytes | null {
        let storageKey = this.keyPrefix + key
        if (near.storageRemove(storageKey)) {
            return near.storageGetEvicted()
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

    extend(kvs: [Bytes, Bytes][]) {
        for(let kv of kvs) {
            this.set(kv[0], kv[1])
        }
    }
}