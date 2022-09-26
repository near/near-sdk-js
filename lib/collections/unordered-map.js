import { assert, getValueWithOptions } from '../utils';
import { Vector, VectorIterator } from './vector';
import { LookupMap } from './lookup-map';
const ERR_INCONSISTENT_STATE = 'The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?';
export class UnorderedMap {
    constructor(prefix) {
        this.prefix = prefix;
        this.keys = new Vector(`${prefix}u`); // intentional different prefix with old UnorderedMap
        this.values = new LookupMap(`${prefix}m`);
    }
    get length() {
        return this.keys.length;
    }
    isEmpty() {
        return this.keys.isEmpty();
    }
    get(key, options) {
        const valueAndIndex = this.values.get(key);
        if (valueAndIndex === null) {
            return options?.defaultValue ?? null;
        }
        const [value] = valueAndIndex;
        return getValueWithOptions(value, options);
    }
    set(key, value, options) {
        const valueAndIndex = this.values.get(key);
        if (valueAndIndex === null) {
            const nextIndex = this.length;
            this.keys.push(key);
            this.values.set(key, [value, nextIndex]);
            return null;
        }
        const [oldValue] = valueAndIndex;
        valueAndIndex[0] = value;
        this.values.set(key, valueAndIndex);
        return getValueWithOptions(oldValue, options);
    }
    remove(key, options) {
        const oldValueAndIndex = this.values.remove(key);
        if (oldValueAndIndex === null) {
            return options?.defaultValue ?? null;
        }
        const [value, index] = oldValueAndIndex;
        assert(this.keys.swapRemove(index) !== null, ERR_INCONSISTENT_STATE);
        // the last key is swapped to key[index], the corresponding [value, index] need update
        if (!this.keys.isEmpty() && index !== this.keys.length) {
            // if there is still elements and it was not the last element
            const swappedKey = this.keys.get(index);
            const swappedValueAndIndex = this.values.get(swappedKey);
            assert(swappedValueAndIndex !== null, ERR_INCONSISTENT_STATE);
            this.values.set(swappedKey, [getValueWithOptions(swappedValueAndIndex[0], options), index]);
        }
        return getValueWithOptions(value, options);
    }
    clear() {
        for (const key of this.keys) {
            // Set instead of remove to avoid loading the value from storage.
            this.values.set(key, null);
        }
        this.keys.clear();
    }
    [Symbol.iterator]() {
        return new UnorderedMapIterator(this);
    }
    createIteratorWithOptions(options) {
        return {
            [Symbol.iterator]: () => new UnorderedMapIterator(this, options),
        };
    }
    toArray(options) {
        const array = [];
        const iterator = options ? this.createIteratorWithOptions(options) : this;
        for (const value of iterator) {
            array.push(value);
        }
        return array;
    }
    extend(keyValuePairs) {
        for (const [key, value] of keyValuePairs) {
            this.set(key, value);
        }
    }
    serialize() {
        return JSON.stringify(this);
    }
    // converting plain object to class object
    static reconstruct(data) {
        const map = new UnorderedMap(data.prefix);
        // reconstruct keys Vector
        map.keys = new Vector(`${data.prefix}u`);
        map.keys.length = data.keys.length;
        // reconstruct values LookupMap
        map.values = new LookupMap(`${data.prefix}m`);
        return map;
    }
}
class UnorderedMapIterator {
    constructor(unorderedMap, options) {
        this.options = options;
        this.keys = new VectorIterator(unorderedMap.keys);
        this.map = unorderedMap.values;
    }
    next() {
        const key = this.keys.next();
        if (key.done) {
            return { value: [key.value, null], done: key.done };
        }
        const [value] = this.map.get(key.value);
        assert(value !== null, ERR_INCONSISTENT_STATE);
        return {
            done: key.done,
            value: [key.value, getValueWithOptions(value, this.options)],
        };
    }
}
