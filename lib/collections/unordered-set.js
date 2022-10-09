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
export class UnorderedSet {
    constructor(prefix) {
        this.prefix = prefix;
        this.elementIndexPrefix = `${prefix}i`;
        this.elements = new Vector(`${prefix}e`);
    }
    get length() {
        return this.elements.length;
    }
    isEmpty() {
        return this.elements.isEmpty();
    }
    contains(element, options) {
        const indexLookup = this.elementIndexPrefix + serializeValueWithOptions(element, options);
        return near.storageHasKey(indexLookup);
    }
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
    createIteratorWithOptions(options) {
        return {
            [Symbol.iterator]: () => new VectorIterator(this.elements, options),
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
    extend(elements) {
        for (const element of elements) {
            this.set(element);
        }
    }
    serialize(options) {
        return serializeValueWithOptions(this, options);
    }
    // converting plain object to class object
    static reconstruct(data) {
        const set = new UnorderedSet(data.prefix);
        // reconstruct Vector
        const elementsPrefix = data.prefix + "e";
        set.elements = new Vector(elementsPrefix);
        set.elements.length = data.elements.length;
        return set;
    }
}
