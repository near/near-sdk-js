import * as near from '../api'
import { Bytes } from '../utils';

export class LookupMap {
    readonly keyPrefix: Bytes;

    constructor(keyPrefix: Bytes) {
        this.keyPrefix = keyPrefix
    }

    containsKey(key: Bytes): boolean {
        let storageKey = this.keyPrefix + key
        return near.jsvmStorageHasKey(storageKey)
    }

    get(key: Bytes): Bytes | null {
        let storageKey = this.keyPrefix + key
        return near.jsvmStorageRead(storageKey)
    }

    remove(key: Bytes): Bytes | null {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageRemove(storageKey)) {
            return near.storageGetEvicted()
        }
        return null
    }

    set(key: Bytes, value: Bytes): Bytes | null {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageWrite(storageKey, value)) {
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