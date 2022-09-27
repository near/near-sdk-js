import * as near from "../api";
import { assert, getValueWithOptions, u8ArrayToBytes, serializeValueWithOptions, ERR_INCONSISTENT_STATE, ERR_INDEX_OUT_OF_BOUNDS, } from "../utils";
function indexToKey(prefix, index) {
    const data = new Uint32Array([index]);
    const array = new Uint8Array(data.buffer);
    const key = u8ArrayToBytes(array);
    return prefix + key;
}
/// An iterable implementation of vector that stores its content on the trie.
/// Uses the following map: index -> element
export class Vector {
    constructor(prefix, length = 0) {
        this.prefix = prefix;
        this.length = length;
    }
    isEmpty() {
        return this.length === 0;
    }
    get(index, options) {
        if (index >= this.length) {
            return options?.defaultValue ?? null;
        }
        const storageKey = indexToKey(this.prefix, index);
        const value = near.storageRead(storageKey);
        return getValueWithOptions(value, options);
    }
    /// Removes an element from the vector and returns it in serialized form.
    /// The removed element is replaced by the last element of the vector.
    /// Does not preserve ordering, but is `O(1)`.
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
    push(element, options) {
        const key = indexToKey(this.prefix, this.length);
        this.length += 1;
        near.storageWrite(key, serializeValueWithOptions(element, options));
    }
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
    replace(index, element, options) {
        assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
        const key = indexToKey(this.prefix, index);
        assert(near.storageWrite(key, serializeValueWithOptions(element, options)), ERR_INCONSISTENT_STATE);
        const value = near.storageGetEvicted();
        return getValueWithOptions(value, options);
    }
    extend(elements) {
        for (const element of elements) {
            this.push(element);
        }
    }
    [Symbol.iterator]() {
        return new VectorIterator(this);
    }
    createIteratorWithOptions(options) {
        return {
            [Symbol.iterator]: () => new VectorIterator(this, options),
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
    clear() {
        for (let index = 0; index < this.length; index++) {
            const key = indexToKey(this.prefix, index);
            near.storageRemove(key);
        }
        this.length = 0;
    }
    serialize(options) {
        return serializeValueWithOptions(this, options);
    }
    // converting plain object to class object
    static reconstruct(data) {
        const vector = new Vector(data.prefix, data.length);
        return vector;
    }
}
export class VectorIterator {
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
