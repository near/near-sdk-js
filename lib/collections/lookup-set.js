import * as near from "../api";
import { serializeValueWithOptions } from "../utils";
export class LookupSet {
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix;
    }
    contains(key, options) {
        const storageKey = this.keyPrefix + serializeValueWithOptions(key, options);
        return near.storageHasKey(storageKey);
    }
    // Returns true if the element was present in the set.
    remove(key, options) {
        const storageKey = this.keyPrefix + serializeValueWithOptions(key, options);
        return near.storageRemove(storageKey);
    }
    // If the set did not have this value present, `true` is returned.
    // If the set did have this value present, `false` is returned.
    set(key, options) {
        const storageKey = this.keyPrefix + serializeValueWithOptions(key, options);
        return !near.storageWrite(storageKey, "");
    }
    extend(keys, options) {
        keys.forEach((key) => this.set(key, options));
    }
    serialize(options) {
        return serializeValueWithOptions(this, options);
    }
    // converting plain object to class object
    static reconstruct(data) {
        return new LookupSet(data.keyPrefix);
    }
}
