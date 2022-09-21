import * as near from "../api";
import { serialize } from "../utils";
export class LookupSet {
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix;
    }
    contains(key) {
        const storageKey = this.keyPrefix + serialize(key);
        return near.storageHasKey(storageKey);
    }
    // Returns true if the element was present in the set.
    remove(key) {
        const storageKey = this.keyPrefix + serialize(key);
        return near.storageRemove(storageKey);
    }
    // If the set did not have this value present, `true` is returned.
    // If the set did have this value present, `false` is returned.
    set(key) {
        const storageKey = this.keyPrefix + serialize(key);
        return !near.storageWrite(storageKey, "");
    }
    extend(keys) {
        keys.forEach((key) => this.set(key));
    }
    serialize() {
        return serialize(this);
    }
    // converting plain object to class object
    static reconstruct(data) {
        return new LookupSet(data.keyPrefix);
    }
}
