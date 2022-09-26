import * as near from '../api';
import { getValueWithOptions } from '../utils';
export class LookupMap {
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix;
    }
    containsKey(key) {
        const storageKey = this.keyPrefix + key;
        return near.storageHasKey(storageKey);
    }
    get(key, options) {
        const storageKey = this.keyPrefix + key;
        const value = JSON.parse(near.storageRead(storageKey));
        return getValueWithOptions(value, options);
    }
    remove(key, options) {
        const storageKey = this.keyPrefix + key;
        if (!near.storageRemove(storageKey)) {
            return options?.defaultValue ?? null;
        }
        const value = JSON.parse(near.storageGetEvicted());
        return getValueWithOptions(value, options);
    }
    set(key, newValue, options) {
        const storageKey = this.keyPrefix + key;
        const storageValue = JSON.stringify(newValue);
        if (!near.storageWrite(storageKey, storageValue)) {
            return options?.defaultValue ?? null;
        }
        const value = JSON.parse(near.storageGetEvicted());
        return getValueWithOptions(value, options);
    }
    extend(keyValuePairs, options) {
        for (const [key, value] of keyValuePairs) {
            this.set(key, value, options);
        }
    }
    serialize() {
        return JSON.stringify(this);
    }
    // converting plain object to class object
    static reconstruct(data) {
        return new LookupMap(data.keyPrefix);
    }
}
