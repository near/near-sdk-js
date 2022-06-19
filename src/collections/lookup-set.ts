import * as near from '../api'

export class LookupSet {
    readonly keyPrefix: string;

    constructor(keyPrefix: string) {
        this.keyPrefix = keyPrefix
    }

    contains(key: string) {
        let storageKey = this.keyPrefix + key
        return near.jsvmStorageHasKey(storageKey)
    }
    
    remove(key: string) {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageRemove(storageKey)) {
            return near.storageGetEvicted()
        }
        return null
    }

    set(key: string) {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageWrite(storageKey, '')) {
            return near.storageGetEvicted()
        }
        return null
    }

    extend(keys: string[]) {
        for(let key of keys) {
            this.set(key)
        }
    }
}