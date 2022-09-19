import { Vector, VectorIterator } from "./vector";
import { LookupMap } from "./lookup-map";
const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
export class UnorderedMap {
    constructor(prefix) {
        this.prefix = prefix;
        this.keys = new Vector(prefix + "u"); // intentional different prefix with old UnorderedMap
        this.values = new LookupMap(prefix + "m");
    }
    get length() {
        const keysLen = this.keys.length;
        return keysLen;
    }
    isEmpty() {
        const keysIsEmpty = this.keys.isEmpty();
        return keysIsEmpty;
    }
    get(key, options) {
        const valueAndIndex = this.values.get(key);
        if (valueAndIndex === null) {
            return null;
        }
        const value = valueAndIndex[0];
        return options?.reconstructor ? options.reconstructor(value) : value;
    }
    set(key, value) {
        const valueAndIndex = this.values.get(key);
        if (valueAndIndex !== null) {
            const oldValue = valueAndIndex[0];
            valueAndIndex[0] = value;
            this.values.set(key, valueAndIndex);
            return oldValue;
        }
        const nextIndex = this.length;
        this.keys.push(key);
        this.values.set(key, [value, nextIndex]);
        return null;
    }
    remove(key) {
        const oldValueAndIndex = this.values.remove(key);
        if (oldValueAndIndex === null) {
            return null;
        }
        const index = oldValueAndIndex[1];
        if (this.keys.swapRemove(index) === null) {
            throw new Error(ERR_INCONSISTENT_STATE);
        }
        // the last key is swapped to key[index], the corresponding [value, index] need update
        if (this.keys.length > 0 && index != this.keys.length) {
            // if there is still elements and it was not the last element
            const swappedKey = this.keys.get(index);
            const swappedValueAndIndex = this.values.get(swappedKey);
            if (swappedValueAndIndex === null) {
                throw new Error(ERR_INCONSISTENT_STATE);
            }
            this.values.set(swappedKey, [swappedValueAndIndex[0], index]);
        }
        return oldValueAndIndex[0];
    }
    clear() {
        for (const key of this.keys) {
            // Set instead of remove to avoid loading the value from storage.
            this.values.set(key, null);
        }
        this.keys.clear();
    }
    toArray() {
        const ret = [];
        for (const v of this) {
            ret.push(v);
        }
        return ret;
    }
    [Symbol.iterator]() {
        return new UnorderedMapIterator(this);
    }
    extend(kvs) {
        for (const [k, v] of kvs) {
            this.set(k, v);
        }
    }
    serialize() {
        return JSON.stringify(this);
    }
    // converting plain object to class object
    static reconstruct(data) {
        const map = new UnorderedMap(data.prefix);
        // reconstruct keys Vector
        map.keys = new Vector(data.prefix + "u");
        map.keys.length = data.keys.length;
        // reconstruct values LookupMap
        map.values = new LookupMap(data.prefix + "m");
        return map;
    }
}
class UnorderedMapIterator {
    constructor(unorderedMap) {
        this.keys = new VectorIterator(unorderedMap.keys);
        this.map = unorderedMap.values;
    }
    next() {
        const key = this.keys.next();
        let value;
        if (!key.done) {
            value = this.map.get(key.value);
            if (value === null) {
                throw new Error(ERR_INCONSISTENT_STATE);
            }
        }
        return { value: [key.value, value ? value[0] : value], done: key.done };
    }
}
