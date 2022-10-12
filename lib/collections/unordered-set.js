import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array, assert, serializeValueWithOptions, ERR_INCONSISTENT_STATE, } from "../utils";
import { Vector, VectorIterator } from "./vector";
function serializeIndex(index) {
    const data = new Uint32Array([index]);
    const array = new Uint8Array(data.buffer);
    return u8ArrayToBytes(array);
}
function deserializeIndex(rawIndex) {
    const array = bytesToU8Array(rawIndex);
    const [data] = new Uint32Array(array.buffer);
    return data;
}
/**
 * An unordered set that stores data in NEAR storage.
 */
export class UnorderedSet {
    /**
     * @param prefix - The byte prefix to use when storing elements inside this collection.
     */
    constructor(prefix) {
        this.prefix = prefix;
        this.elementIndexPrefix = `${prefix}i`;
        this.elements = new Vector(`${prefix}e`);
    }
    /**
     * The number of elements stored in the collection.
     */
    get length() {
        return this.elements.length;
    }
    /**
     * Checks whether the collection is empty.
     */
    isEmpty() {
        return this.elements.isEmpty();
    }
    /**
     * Checks whether the collection contains the value.
     *
     * @param element - The value for which to check the presence.
     * @param options - Options for storing data.
     */
    contains(element, options) {
        const indexLookup = this.elementIndexPrefix + serializeValueWithOptions(element, options);
        return near.storageHasKey(indexLookup);
    }
    /**
     * If the set did not have this value present, `true` is returned.
     * If the set did have this value present, `false` is returned.
     *
     * @param element - The value to store in the collection.
     * @param options - Options for storing the data.
     */
    set(element, options) {
        const indexLookup = this.elementIndexPrefix + serializeValueWithOptions(element, options);
        if (near.storageRead(indexLookup)) {
            return false;
        }
        const nextIndex = this.length;
        const nextIndexRaw = serializeIndex(nextIndex);
        near.storageWrite(indexLookup, nextIndexRaw);
        this.elements.push(element, options);
        return true;
    }
    /**
     * Returns true if the element was present in the set.
     *
     * @param element - The entry to remove.
     * @param options - Options for retrieving and storing data.
     */
    remove(element, options) {
        const indexLookup = this.elementIndexPrefix + serializeValueWithOptions(element, options);
        const indexRaw = near.storageRead(indexLookup);
        if (!indexRaw) {
            return false;
        }
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        if (this.length === 1) {
            near.storageRemove(indexLookup);
            const index = deserializeIndex(indexRaw);
            this.elements.swapRemove(index);
            return true;
        }
        // If there is more than one element then swap remove swaps it with the last
        // element.
        const lastElement = this.elements.get(this.length - 1, options);
        assert(!!lastElement, ERR_INCONSISTENT_STATE);
        near.storageRemove(indexLookup);
        // If the removed element was the last element from keys, then we don't need to
        // reinsert the lookup back.
        if (lastElement !== element) {
            const lastLookupElement = this.elementIndexPrefix +
                serializeValueWithOptions(lastElement, options);
            near.storageWrite(lastLookupElement, indexRaw);
        }
        const index = deserializeIndex(indexRaw);
        this.elements.swapRemove(index);
        return true;
    }
    /**
     * Remove all of the elements stored within the collection.
     */
    clear(options) {
        for (const element of this.elements) {
            const indexLookup = this.elementIndexPrefix + serializeValueWithOptions(element, options);
            near.storageRemove(indexLookup);
        }
        this.elements.clear();
    }
    [Symbol.iterator]() {
        return this.elements[Symbol.iterator]();
    }
    /**
     * Create a iterator on top of the default collection iterator using custom options.
     *
     * @param options - Options for retrieving and storing the data.
     */
    createIteratorWithOptions(options) {
        return {
            [Symbol.iterator]: () => new VectorIterator(this.elements, options),
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
     * Extends the current collection with the passed in array of elements.
     *
     * @param elements - The elements to extend the collection with.
     */
    extend(elements) {
        for (const element of elements) {
            this.set(element);
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
        const set = new UnorderedSet(data.prefix);
        // reconstruct Vector
        const elementsPrefix = data.prefix + "e";
        set.elements = new Vector(elementsPrefix);
        set.elements.length = data.elements.length;
        return set;
    }
}
