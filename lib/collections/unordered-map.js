import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array } from "../utils";
import { Vector, VectorIterator } from "./vector";
const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
function serializeIndex(index) {
    let data = new Uint32Array([index]);
    let array = new Uint8Array(data.buffer);
    return u8ArrayToBytes(array);
}
function deserializeIndex(rawIndex) {
    let array = bytesToU8Array(rawIndex);
    let data = new Uint32Array(array.buffer);
    return data[0];
}
function getIndexRaw(keyIndexPrefix, key) {
    let indexLookup = keyIndexPrefix + JSON.stringify(key);
    let indexRaw = near.storageRead(indexLookup);
    return indexRaw;
}
export class UnorderedMap {
    constructor(prefix) {
        this.prefix = prefix;
        this.keyIndexPrefix = prefix + "i";
        let indexKey = prefix + "k";
        let indexValue = prefix + "v";
        this.keys = new Vector(indexKey);
        this.values = new Vector(indexValue);
    }
    get length() {
        let keysLen = this.keys.length;
        let valuesLen = this.values.length;
        if (keysLen != valuesLen) {
            throw new Error(ERR_INCONSISTENT_STATE);
        }
        return keysLen;
    }
    // noop, called by deserialize
    set length(_l) { }
    isEmpty() {
        let keysIsEmpty = this.keys.isEmpty();
        let valuesIsEmpty = this.values.isEmpty();
        if (keysIsEmpty != valuesIsEmpty) {
            throw new Error(ERR_INCONSISTENT_STATE);
        }
        return keysIsEmpty;
    }
    get(key) {
        let indexRaw = getIndexRaw(this.keyIndexPrefix, key);
        if (indexRaw) {
            let index = deserializeIndex(indexRaw);
            let value = this.values.get(index);
            if (value) {
                return value;
            }
            else {
                throw new Error(ERR_INCONSISTENT_STATE);
            }
        }
        return null;
    }
    set(key, value) {
        let indexLookup = this.keyIndexPrefix + JSON.stringify(key);
        let indexRaw = near.storageRead(indexLookup);
        if (indexRaw) {
            let index = deserializeIndex(indexRaw);
            return this.values.replace(index, value);
        }
        else {
            let nextIndex = this.length;
            let nextIndexRaw = serializeIndex(nextIndex);
            near.storageWrite(indexLookup, nextIndexRaw);
            this.keys.push(key);
            this.values.push(value);
            return null;
        }
    }
    remove(key) {
        let indexLookup = this.keyIndexPrefix + JSON.stringify(key);
        let indexRaw = near.storageRead(indexLookup);
        if (indexRaw) {
            if (this.length == 1) {
                // If there is only one element then swap remove simply removes it without
                // swapping with the last element.
                near.storageRemove(indexLookup);
            }
            else {
                // If there is more than one element then swap remove swaps it with the last
                // element.
                let lastKey = this.keys.get(this.length - 1);
                if (!lastKey) {
                    throw new Error(ERR_INCONSISTENT_STATE);
                }
                near.storageRemove(indexLookup);
                // If the removed element was the last element from keys, then we don't need to
                // reinsert the lookup back.
                if (lastKey != key) {
                    let lastLookupKey = this.keyIndexPrefix + JSON.stringify(lastKey);
                    near.storageWrite(lastLookupKey, indexRaw);
                }
            }
            let index = deserializeIndex(indexRaw);
            this.keys.swapRemove(index);
            return this.values.swapRemove(index);
        }
        return null;
    }
    clear() {
        for (let key of this.keys) {
            let indexLookup = this.keyIndexPrefix + JSON.stringify(key);
            near.storageRemove(indexLookup);
        }
        this.keys.clear();
        this.values.clear();
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
    static deserialize(data) {
        let map = new UnorderedMap(data.prefix);
        // reconstruct UnorderedMap
        map.length = data.length;
        // reconstruct keys Vector
        map.keys = new Vector(data.prefix + "k");
        map.keys.length = data.keys.length;
        // reconstruct values Vector
        map.values = new Vector(data.prefix + "v");
        map.values.length = data.values.length;
        return map;
    }
}
class UnorderedMapIterator {
    constructor(unorderedMap) {
        this.keys = new VectorIterator(unorderedMap.keys);
        this.values = new VectorIterator(unorderedMap.values);
    }
    next() {
        let key = this.keys.next();
        let value = this.values.next();
        if (key.done != value.done) {
            throw new Error(ERR_INCONSISTENT_STATE);
        }
        return { value: [key.value, value.value], done: key.done };
    }
}
