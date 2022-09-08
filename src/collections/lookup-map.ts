import * as near from '../api'
import { Bytes } from '../utils';

export class LookupMap<DataType> {
    readonly keyPrefix: Bytes;

    constructor(keyPrefix: Bytes) {
        this.keyPrefix = keyPrefix
    }

    containsKey(key: Bytes): boolean {
        let storageKey = this.keyPrefix + JSON.stringify(key)
        return near.storageHasKey(storageKey)
    }

    get(key: Bytes, deserializer?: (value: unknown) => DataType): DataType | null {
        let storageKey = this.keyPrefix + JSON.stringify(key)
        let raw = near.storageRead(storageKey)
        if (raw !== null) {
            const value = JSON.parse(raw)
            return !!deserializer ? deserializer(value) : value as DataType
        }
        return null
    }

    remove(key: Bytes): DataType | null {
        let storageKey = this.keyPrefix + JSON.stringify(key)
        if (near.storageRemove(storageKey)) {
            return JSON.parse(near.storageGetEvicted())
        }
        return null
    }

    set(key: Bytes, value: DataType): DataType | null {
        let storageKey = this.keyPrefix + JSON.stringify(key)
        let storageValue = JSON.stringify(value)
        if (near.storageWrite(storageKey, storageValue)) {
            return JSON.parse(near.storageGetEvicted())
        }
        return null
    }

    extend(objects: [Bytes, DataType][]) {
        for (let kv of objects) {
            this.set(kv[0], kv[1])
        }
    }

    serialize(): string {
        return JSON.stringify(this)
    }

    // converting plain object to class object
    static deserialize<DataType>(data: LookupMap<DataType>): LookupMap<DataType> {
        return new LookupMap(data.keyPrefix)
    }
}