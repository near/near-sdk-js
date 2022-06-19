import * as near from '../api'

export class LookupMap {
    readonly keyPrefix: string;

    constructor(keyPrefix: string) {
        this.keyPrefix = keyPrefix
    }

    containsKey(key: string): boolean {
        let storageKey = this.keyPrefix + key
        return near.jsvmStorageHasKey(storageKey)
    }

    get(key: string): string | null {
        let storageKey = this.keyPrefix + key
        return near.jsvmStorageRead(storageKey)
    }

    remove(key: string): string | null {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageRemove(storageKey)) {
            return near.storageGetEvicted()
        }
        return null
    }

    set(key: string, value: string): string | null {
        let storageKey = this.keyPrefix + key
        if (near.jsvmStorageWrite(storageKey, value)) {
            return near.storageGetEvicted()
        }
        return null
    }

    extend(kvs: [string, string][]) {
        for(let kv of kvs) {
            this.set(kv[0], kv[1])
        }
    }
}