import * as near from '../api'
import { u8ArrayToLatin1 } from '../utils';

export class LookupMap {
    readonly keyPrefix: string;

    constructor(keyPrefix: string) {
        this.keyPrefix = keyPrefix
    }

    containsKey(key: string): boolean {
        let storageKey = this.keyPrefix + JSON.stringify(key)
        return near.storageHasKey(storageKey)
    }

    get(key: string): unknown | null {
        let storageKey = this.keyPrefix + JSON.stringify(key)
        let raw = near.storageRead(storageKey)
        if (raw !== null) {
            return JSON.parse(u8ArrayToLatin1(raw))
        }
        return null
    }

    remove(key: string): unknown | null {
        let storageKey = this.keyPrefix + JSON.stringify(key)
        if (near.storageRemove(storageKey)) {
            return JSON.parse(u8ArrayToLatin1(near.storageGetEvicted()))
        }
        return null
    }

    set(key: string, value: unknown): unknown | null {
        let storageKey = this.keyPrefix + JSON.stringify(key)
        let storageValue = JSON.stringify(value)
        if (near.storageWrite(storageKey, storageValue)) {
            return JSON.parse(u8ArrayToLatin1(near.storageGetEvicted()))
        }
        return null
    }

    extend(objects: [string, unknown][]) {
        for (let kv of objects) {
            this.set(kv[0], kv[1])
        }
    }

    serialize(): string {
        return JSON.stringify(this)
    }

    // converting plain object to class object
    static deserialize(data: LookupMap): LookupMap {
        return new LookupMap(data.keyPrefix)
    }
}