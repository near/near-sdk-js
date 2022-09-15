import { Vector, VectorIterator } from "./vector";
import { LookupMap } from "./lookup-map";
const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
export class UnorderedMap {
    constructor(prefix) {
        this.prefix = prefix;
        this.keys = new Vector(prefix + 'u'); // intentional different prefix with old UnorderedMap
        this.values = new LookupMap(prefix + 'm');
    }
    get length() {
        let keysLen = this.keys.length;
        return keysLen;
    }
    isEmpty() {
        let keysIsEmpty = this.keys.isEmpty();
        return keysIsEmpty;
    }
    get(key) {
        let valueAndIndex = this.values.get(key);
        if (valueAndIndex === null) {
            return null;
        }
        let value = valueAndIndex[0];
        return value;
    }
    set(key, value) {
        let valueAndIndex = this.values.get(key);
        if (valueAndIndex !== null) {
            let oldValue = valueAndIndex[0];
            valueAndIndex[0] = value;
            this.values.set(key, valueAndIndex);
            return oldValue;
        }
        let nextIndex = this.length;
        this.keys.push(key);
        this.values.set(key, [value, nextIndex]);
        return null;
    }
    remove(key) {
        let oldValueAndIndex = this.values.remove(key);
        if (oldValueAndIndex === null) {
            return null;
        }
        let index = oldValueAndIndex[1];
        if (this.keys.swapRemove(index) === null) {
            throw new Error(ERR_INCONSISTENT_STATE);
        }
        // the last key is swapped to key[index], the corresponding [value, index] need update
        if (this.keys.length > 0 && index != this.keys.length) {
            // if there is still elements and it was not the last element
            let swappedKey = this.keys.get(index);
            let swappedValueAndIndex = this.values.get(swappedKey);
            if (swappedValueAndIndex === null) {
                throw new Error(ERR_INCONSISTENT_STATE);
            }
            this.values.set(swappedKey, [swappedValueAndIndex[0], index]);
        }
        return oldValueAndIndex[0];
    }
    clear() {
        for (let key of this.keys) {
            // Set instead of remove to avoid loading the value from storage.
            this.values.set(key, null);
        }
        this.keys.clear();
    }
    toArray() {
        let ret = [];
        for (let v of this) {
            ret.push(v);
        }
        return ret;
    }
    [Symbol.iterator]() {
        return new UnorderedMapIterator(this);
    }
    extend(kvs) {
        for (let [k, v] of kvs) {
            this.set(k, v);
        }
    }
    serialize() {
        return JSON.stringify(this);
    }
    // converting plain object to class object
    static reconstruct(data) {
        let map = new UnorderedMap(data.prefix);
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
        let key = this.keys.next();
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
