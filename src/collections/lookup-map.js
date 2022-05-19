import * as near from '../api'

export class LookupMap {
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix
    }

    containsKey(key) {
        let storageKey = this.keyPrefix + key
        return near.jsvmStorageHasKey(storageKey)
    }

    get(key) {
        let storageKey = this.keyPrefix + key
        return near.jsvmStorageRead(storageKey)
    }

    remove(key) {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageRemove(storageKey)) {
            return near.storageGetEvicted()
        }
        return null
    }

    set(key, value) {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageWrite(storageKey, value)) {
            return near.storageGetEvicted()
        }
        return null
    }

    extend(kvs) {
        for(let kv of kvs) {
            this.set(kv[0], kv[1])
        }
    }
}