import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array } from "../utils";
import { Vector, VectorIterator } from "./vector";
const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
export class UnorderedMap {
    constructor(prefix) {
        this.length = 0;
        this.keyIndexPrefix = prefix + "i";
        let indexKey = prefix + "k";
        let indexValue = prefix + "v";
        this.keys = new Vector(indexKey);
        this.values = new Vector(indexValue);
    }
    len() {
        let keysLen = this.keys.len();
        let valuesLen = this.values.len();
        if (keysLen != valuesLen) {
            throw new Error(ERR_INCONSISTENT_STATE);
        }
        return keysLen;
    }
    isEmpty() {
        let keysIsEmpty = this.keys.isEmpty();
        let valuesIsEmpty = this.values.isEmpty();
        if (keysIsEmpty != valuesIsEmpty) {
            throw new Error(ERR_INCONSISTENT_STATE);
        }
        return keysIsEmpty;
    }
    serializeIndex(index) {
        let data = new Uint32Array([index]);
        let array = new Uint8Array(data.buffer);
        return u8ArrayToBytes(array);
    }
    deserializeIndex(rawIndex) {
        let array = bytesToU8Array(rawIndex);
        let data = new Uint32Array(array.buffer);
        return data[0];
    }
    getIndexRaw(key) {
        let indexLookup = this.keyIndexPrefix + key;
        let indexRaw = near.storageRead(indexLookup);
        return indexRaw;
    }
    get(key) {
        let indexRaw = this.getIndexRaw(key);
        if (indexRaw) {
            let index = this.deserializeIndex(indexRaw);
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
        let indexLookup = this.keyIndexPrefix + key;
        let indexRaw = near.storageRead(indexLookup);
        if (indexRaw) {
            let index = this.deserializeIndex(indexRaw);
            return this.values.replace(index, value);
        }
        else {
            let nextIndex = this.len();
            let nextIndexRaw = this.serializeIndex(nextIndex);
            near.storageWrite(indexLookup, nextIndexRaw);
            this.keys.push(key);
            this.values.push(value);
            return null;
        }
    }
    remove(key) {
        let indexLookup = this.keyIndexPrefix + key;
        let indexRaw = near.storageRead(indexLookup);
        if (indexRaw) {
            if (this.len() == 1) {
                // If there is only one element then swap remove simply removes it without
                // swapping with the last element.
                near.storageRemove(indexLookup);
            }
            else {
                // If there is more than one element then swap remove swaps it with the last
                // element.
                let lastKeyRaw = this.keys.get(this.len() - 1);
                if (!lastKeyRaw) {
                    throw new Error(ERR_INCONSISTENT_STATE);
                }
                near.storageRemove(indexLookup);
                // If the removed element was the last element from keys, then we don't need to
                // reinsert the lookup back.
                if (lastKeyRaw != key) {
                    let lastLookupKey = this.keyIndexPrefix + lastKeyRaw;
                    near.storageWrite(lastLookupKey, indexRaw);
                }
            }
            let index = this.deserializeIndex(indexRaw);
            this.keys.swapRemove(index);
            return this.values.swapRemove(index);
        }
        return null;
    }
    clear() {
        for (let key of this.keys) {
            let indexLookup = this.keyIndexPrefix + key;
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
