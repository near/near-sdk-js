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
        return near.jsvmStorageRemove(storageKey)
    }

    set(key, value) {
        let storageKey = this.keyPrefix + key
        return near.jsvmStorageWrite(storageKey, value)
    }

    extend(kvs) {
        for(let kv of kvs) {
            this.set(kv[0], kv[1])
        }
    }
}