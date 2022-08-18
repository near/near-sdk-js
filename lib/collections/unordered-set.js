import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array } from "../utils";
import { Vector } from "./vector";
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
export class UnorderedSet {
    constructor(prefix) {
        this.length = 0;
        this.prefix = prefix;
        this.elementIndexPrefix = prefix + "i";
        let elementsPrefix = prefix + "e";
        this.elements = new Vector(elementsPrefix);
    }
    len() {
        return this.elements.len();
    }
    isEmpty() {
        return this.elements.isEmpty();
    }
    contains(element) {
        let indexLookup = this.elementIndexPrefix + JSON.stringify(element);
        return near.storageHasKey(indexLookup);
    }
    set(element) {
        let indexLookup = this.elementIndexPrefix + JSON.stringify(element);
        if (near.storageRead(indexLookup)) {
            return false;
        }
        else {
            let nextIndex = this.len();
            let nextIndexRaw = serializeIndex(nextIndex);
            near.storageWrite(indexLookup, nextIndexRaw);
            this.elements.push(element);
            return true;
        }
    }
    remove(element) {
        let indexLookup = this.elementIndexPrefix + JSON.stringify(element);
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
                let lastElement = this.elements.get(this.len() - 1);
                if (!lastElement) {
                    throw new Error(ERR_INCONSISTENT_STATE);
                }
                near.storageRemove(indexLookup);
                // If the removed element was the last element from keys, then we don't need to
                // reinsert the lookup back.
                if (lastElement != element) {
                    let lastLookupElement = this.elementIndexPrefix + JSON.stringify(lastElement);
                    near.storageWrite(lastLookupElement, indexRaw);
                }
            }
            let index = deserializeIndex(indexRaw);
            this.elements.swapRemove(index);
            return true;
        }
        return false;
    }
    clear() {
        for (let element of this.elements) {
            let indexLookup = this.elementIndexPrefix + JSON.stringify(element);
            near.storageRemove(indexLookup);
        }
        this.elements.clear();
    }
    toArray() {
        let ret = [];
        for (let v of this) {
            ret.push(v);
        }
        return ret;
    }
    [Symbol.iterator]() {
        return this.elements[Symbol.iterator]();
    }
    extend(elements) {
        for (let element of elements) {
            this.set(element);
        }
    }
    serialize() {
        return JSON.stringify(this);
    }
    // converting plain object to class object
    static deserialize(data) {
        let set = new UnorderedSet(data.prefix);
        // reconstruct UnorderedSet
        set.length = data.length;
        // reconstruct Vector
        let elementsPrefix = data.prefix + "e";
        set.elements = new Vector(elementsPrefix);
        set.elements.length = data.elements.length;
        return set;
    }
}
