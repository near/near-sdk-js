import * as near from '../api'
import { Bytes } from '../utils';

export class LookupSet {
    readonly keyPrefix: Bytes;

    constructor(keyPrefix: Bytes) {
        this.keyPrefix = keyPrefix
    }

    contains(key: Bytes) {
        let storageKey = this.keyPrefix + key
        return near.jsvmStorageHasKey(storageKey)
    }
    
    remove(key: Bytes) {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageRemove(storageKey)) {
            return near.storageGetEvicted()
        }
        return null
    }

    set(key: Bytes) {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageWrite(storageKey, '')) {
            return near.storageGetEvicted()
        }
        return null
    }

    extend(keys: Bytes[]) {
        for(let key of keys) {
            this.set(key)
        }
    }
}