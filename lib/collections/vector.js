import * as near from "../api";
import { assert, getValueWithOptions, u8ArrayToBytes, serializeValueWithOptions, ERR_INCONSISTENT_STATE, ERR_INDEX_OUT_OF_BOUNDS, } from "../utils";
function indexToKey(prefix, index) {
    const data = new Uint32Array([index]);
    const array = new Uint8Array(data.buffer);
    const key = u8ArrayToBytes(array);
    return prefix + key;
}
/**
 * An iterable implementation of vector that stores its content on the trie.
 * Uses the following map: index -> element
 */
export class Vector {
    /**
     * @param prefix - The byte prefix to use when storing elements inside this collection.
     * @param length - The initial length of the collection. By default 0.
     */
    constructor(prefix, length = 0) {
        this.prefix = prefix;
        this.length = length;
    }
    /**
     * Checks whether the collection is empty.
     */
    isEmpty() {
        return this.length === 0;
    }
    /**
     * Get the data stored at the provided index.
     *
     * @param index - The index at which to look for the data.
     * @param options - Options for retrieving the data.
     */
    get(index, options) {
        if (index >= this.length) {
            return options?.defaultValue ?? null;
        }
        const storageKey = indexToKey(this.prefix, index);
        const value = near.storageRead(storageKey);
        return getValueWithOptions(value, options);
    }
    /**
     * Removes an element from the vector and returns it in serialized form.
     * The removed element is replaced by the last element of the vector.
     * Does not preserve ordering, but is `O(1)`.
     *
     * @param index - The index at which to remove the element.
     * @param options - Options for retrieving and storing the data.
     */
    swapRemove(index, options) {
        assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
        if (index + 1 === this.length) {
            return this.pop(options);
        }
        const key = indexToKey(this.prefix, index);
        const last = this.pop(options);
        assert(near.storageWrite(key, serializeValueWithOptions(last, options)), ERR_INCONSISTENT_STATE);
        const value = near.storageGetEvicted();
        return getValueWithOptions(value, options);
    }
    /**
     * Adds data to the collection.
     *
     * @param element - The data to store.
     * @param options - Options for storing the data.
     */
    push(element, options) {
        const key = indexToKey(this.prefix, this.length);
        this.length += 1;
        near.storageWrite(key, serializeValueWithOptions(element, options));
    }
    /**
     * Removes and retrieves the element with the highest index.
     *
     * @param options - Options for retrieving the data.
     */
    pop(options) {
        if (this.isEmpty()) {
            return options?.defaultValue ?? null;
        }
        const lastIndex = this.length - 1;
        const lastKey = indexToKey(this.prefix, lastIndex);
        this.length -= 1;
        assert(near.storageRemove(lastKey), ERR_INCONSISTENT_STATE);
        const value = near.storageGetEvicted();
        return getValueWithOptions(value, options);
    }
    /**
     * Replaces the data stored at the provided index with the provided data and returns the previously stored data.
     *
     * @param index - The index at which to replace the data.
     * @param element - The data to replace with.
     * @param options - Options for retrieving and storing the data.
     */
    replace(index, element, options) {
        assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
        const key = indexToKey(this.prefix, index);
        assert(near.storageWrite(key, serializeValueWithOptions(element, options)), ERR_INCONSISTENT_STATE);
        const value = near.storageGetEvicted();
        return getValueWithOptions(value, options);
    }
    /**
     * Extends the current collection with the passed in array of elements.
     *
     * @param elements - The elements to extend the collection with.
     */
    extend(elements) {
        for (const element of elements) {
            this.push(element);
        }
    }
    [Symbol.iterator]() {
        return new VectorIterator(this);
    }
    /**
     * Create a iterator on top of the default collection iterator using custom options.
     *
     * @param options - Options for retrieving and storing the data.
     */
    createIteratorWithOptions(options) {
        return {
            [Symbol.iterator]: () => new VectorIterator(this, options),
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
     * Remove all of the elements stored within the collection.
     */
    clear() {
        for (let index = 0; index < this.length; index++) {
            const key = indexToKey(this.prefix, index);
            near.storageRemove(key);
        }
        this.length = 0;
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
        const vector = new Vector(data.prefix, data.length);
        return vector;
    }
}
/**
 * An iterator for the Vector collection.
 */
export class VectorIterator {
    /**
     * @param vector - The vector collection to create an iterator for.
     * @param options - Options for retrieving and storing data.
     */
    constructor(vector, options) {
        this.vector = vector;
        this.options = options;
        this.current = 0;
    }
    next() {
        if (this.current >= this.vector.length) {
            return { value: null, done: true };
        }
        const value = this.vector.get(this.current, this.options);
        this.current += 1;
        return { value, done: false };
    }
}
