import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array } from "../utils";
import { Vector, VectorIterator } from "./vector";

const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";

export class UnorderedMap {
  readonly length: number;
  readonly keyIndexPrefix: string;
  readonly keys: Vector;
  readonly values: Vector;

  constructor(prefix: string) {
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

  serializeIndex(index: number): string {
    let data = new Uint32Array([index]);
    let array = new Uint8Array(data.buffer);
    return u8ArrayToBytes(array);
  }

  deserializeIndex(rawIndex: string) {
    let array = bytesToU8Array(rawIndex);
    let data = new Uint32Array(array.buffer);
    return data[0];
  }

  getIndexRaw(key: string): string {
    let indexLookup = this.keyIndexPrefix + key;
    let indexRaw = near.jsvmStorageRead(indexLookup);
    return indexRaw;
  }

  get(key: string): string | null {
    let indexRaw = this.getIndexRaw(key);
    if (indexRaw) {
      let index = this.deserializeIndex(indexRaw);
      let value = this.values.get(index);
      if (value) {
        return value;
      } else {
        throw new Error(ERR_INCONSISTENT_STATE);
      }
    }
    return null;
  }

  set(key: string, value: string): string | null {
    let indexLookup = this.keyIndexPrefix + key;
    let indexRaw = near.jsvmStorageRead(indexLookup);
    if (indexRaw) {
      let index = this.deserializeIndex(indexRaw);
      return this.values.replace(index, value);
    } else {
      let nextIndex = this.len();
      let nextIndexRaw = this.serializeIndex(nextIndex);
      near.jsvmStorageWrite(indexLookup, nextIndexRaw);
      this.keys.push(key);
      this.values.push(value);
      return null;
    }
  }

  remove(key: string): string | null {
    let indexLookup = this.keyIndexPrefix + key;
    let indexRaw = near.jsvmStorageRead(indexLookup);
    if (indexRaw) {
      if (this.len() == 1) {
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        near.jsvmStorageRemove(indexLookup);
      } else {
        // If there is more than one element then swap remove swaps it with the last
        // element.
        let lastKeyRaw = this.keys.get(this.len() - 1);
        if (!lastKeyRaw) {
          throw new Error(ERR_INCONSISTENT_STATE);
        }
        near.jsvmStorageRemove(indexLookup);
        // If the removed element was the last element from keys, then we don't need to
        // reinsert the lookup back.
        if (lastKeyRaw != key) {
          let lastLookupKey = this.keyIndexPrefix + lastKeyRaw;
          near.jsvmStorageWrite(lastLookupKey, indexRaw);
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
      near.jsvmStorageRemove(indexLookup);
    }
    this.keys.clear();
    this.values.clear();
  }

  toArray(): [string, string][] {
    let ret = [];
    for (let v of this) {
      ret.push(v);
    }
    return ret;
  }

  [Symbol.iterator](): UnorderedMapIterator {
    return new UnorderedMapIterator(this);
  }

  extend(kvs: [string, string][]) {
    for (let [k, v] of kvs) {
      this.set(k, v);
    }
  }
}

class UnorderedMapIterator {
  private keys: VectorIterator;
  private values: VectorIterator;
  constructor(unorderedMap: UnorderedMap) {
    this.keys = new VectorIterator(unorderedMap.keys);
    this.values = new VectorIterator(unorderedMap.values);
  }

  next(): { value: [string | null, string | null]; done: boolean } {
    let key = this.keys.next();
    let value = this.values.next();
    if (key.done != value.done) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }
    return { value: [key.value, value.value], done: key.done };
  }
}
