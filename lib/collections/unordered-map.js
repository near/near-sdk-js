import { assert, ERR_INCONSISTENT_STATE, getValueWithOptions, serializeValueWithOptions, } from "../utils";
import { Vector, VectorIterator } from "./vector";
import { LookupMap } from "./lookup-map";
/**
 * An unordered map that stores data in NEAR storage.
 */
export class UnorderedMap {
    /**
     * @param prefix - The byte prefix to use when storing elements inside this collection.
     */
    constructor(prefix) {
        this.prefix = prefix;
        this.keys = new Vector(`${prefix}u`); // intentional different prefix with old UnorderedMap
        this.values = new LookupMap(`${prefix}m`);
    }
    /**
     * The number of elements stored in the collection.
     */
    get length() {
        return this.keys.length;
    }
    /**
     * Checks whether the collection is empty.
     */
    isEmpty() {
        return this.keys.isEmpty();
    }
    /**
     * Get the data stored at the provided key.
     *
     * @param key - The key at which to look for the data.
     * @param options - Options for retrieving the data.
     */
    get(key, options) {
        const valueAndIndex = this.values.get(key);
        if (valueAndIndex === null) {
            return options?.defaultValue ?? null;
        }
        const [value] = valueAndIndex;
        return getValueWithOptions(value, options);
    }
    /**
     * Store a new value at the provided key.
     *
     * @param key - The key at which to store in the collection.
     * @param value - The value to store in the collection.
     * @param options - Options for retrieving and storing the data.
     */
    set(key, value, options) {
        const valueAndIndex = this.values.get(key);
        const serialized = serializeValueWithOptions(value, options);
        if (valueAndIndex === null) {
            const newElementIndex = this.length;
            this.keys.push(key);
            this.values.set(key, [serialized, newElementIndex]);
            return null;
        }
        const [oldValue, oldIndex] = valueAndIndex;
        this.values.set(key, [serialized, oldIndex]);
        return getValueWithOptions(oldValue, options);
    }
    /**
     * Removes and retrieves the element with the provided key.
     *
     * @param key - The key at which to remove data.
     * @param options - Options for retrieving the data.
     */
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
            this.values.set(swappedKey, [swappedValueAndIndex[0], index]);
        }
        return getValueWithOptions(value, options);
    }
    /**
     * Remove all of the elements stored within the collection.
     */
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
    /**
     * Create a iterator on top of the default collection iterator using custom options.
     *
     * @param options - Options for retrieving and storing the data.
     */
    createIteratorWithOptions(options) {
        return {
            [Symbol.iterator]: () => new UnorderedMapIterator(this, options),
        };
    }
    /**
     * Return a JavaScript array of the data stored within the collection.
     *
     * @param options - Options for retrieving and storing the data.
     */
    toArray(options) {
        const array = [];
        const iterator = options ? this.createIteratorWithOptions(options) : this;
        for (const value of iterator) {
            array.push(value);
        }
        return array;
    }
    /**
     * Extends the current collection with the passed in array of key-value pairs.
     *
     * @param keyValuePairs - The key-value pairs to extend the collection with.
     */
    extend(keyValuePairs) {
        for (const [key, value] of keyValuePairs) {
            this.set(key, value);
        }
    }
    /**
     * Serialize the collection.
     *
     * @param options - Options for storing the data.
     */
    serialize(options) {
        return serializeValueWithOptions(this, options);
    }
    /**
     * Converts the deserialized data from storage to a JavaScript instance of the collection.
     *
     * @param data - The deserialized data to create an instance from.
     */
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
/**
 * An iterator for the UnorderedMap collection.
 */
class UnorderedMapIterator {
    /**
     * @param unorderedMap - The unordered map collection to create an iterator for.
     * @param options - Options for retrieving and storing data.
     */
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
        const valueAndIndex = this.map.get(key.value);
        assert(valueAndIndex !== null, ERR_INCONSISTENT_STATE);
        return {
            done: key.done,
            value: [key.value, getValueWithOptions(valueAndIndex[0], this.options)],
        };
    }
}
