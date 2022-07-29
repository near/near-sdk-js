import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array, Bytes, ClassMap } from "../utils";
import { Vector, VectorIterator } from "./vector";
import { Serializer } from 'superserial';

const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";

export class UnorderedMap<K, V> {
  readonly length: number;
  readonly keyIndexPrefix: Bytes;
  readonly keys: Vector<K>;
  readonly values: Vector<V>;
  readonly serializer: Serializer;

  constructor(prefix: Bytes, classes?: ClassMap) {
    this.length = 0;
    this.keyIndexPrefix = prefix + "i";
    let indexKey = prefix + "k";
    let indexValue = prefix + "v";
    this.keys = new Vector(indexKey);
    this.values = new Vector(indexValue);
    this.serializer = new Serializer(classes)
  }

  len() {
    let keysLen = this.keys.len();
    let valuesLen = this.values.len();
    if (keysLen != valuesLen) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }
    return keysLen;
  }

  isEmpty(): boolean {
    let keysIsEmpty = this.keys.isEmpty();
    let valuesIsEmpty = this.values.isEmpty();
    if (keysIsEmpty != valuesIsEmpty) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }
    return keysIsEmpty;
  }

  serializeIndex(index: number): Bytes {
    let data = new Uint32Array([index]);
    let array = new Uint8Array(data.buffer);
    return u8ArrayToBytes(array);
  }

  deserializeIndex(rawIndex: Bytes) {
    let array = bytesToU8Array(rawIndex);
    let data = new Uint32Array(array.buffer);
    return data[0];
  }

  getIndexRaw(key: K): Bytes {
    let indexLookup = this.keyIndexPrefix + this.serializer.serialize(key);
    let indexRaw = near.storageRead(indexLookup);
    return indexRaw;
  }

  get(key: K): V | null {
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

  set(key: K, value: V): V | null {
    let indexLookup = this.keyIndexPrefix + this.serializer.serialize(key);
    let indexRaw = near.storageRead(indexLookup);
    if (indexRaw) {
      let index = this.deserializeIndex(indexRaw);
      return this.values.replace(index, value);
    } else {
      let nextIndex = this.len();
      let nextIndexRaw = this.serializeIndex(nextIndex);
      near.storageWrite(indexLookup, nextIndexRaw);
      this.keys.push(key);
      this.values.push(value);
      return null;
    }
  }

  remove(key: K): V | null {
    let indexLookup = this.keyIndexPrefix + this.serializer.serialize(key);
    let indexRaw = near.storageRead(indexLookup);
    if (indexRaw) {
      if (this.len() == 1) {
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        near.storageRemove(indexLookup);
      } else {
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
          let lastLookupKey = this.keyIndexPrefix + this.serializer.serialize(lastKeyRaw);
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
      let indexLookup = this.keyIndexPrefix + this.serializer.serialize(key);
      near.storageRemove(indexLookup);
    }
    this.keys.clear();
    this.values.clear();
  }

  toArray(): [K, V][] {
    let ret = [];
    for (let v of this) {
      ret.push(v);
    }
    return ret;
  }

  [Symbol.iterator](): UnorderedMapIterator<K, V> {
    return new UnorderedMapIterator<K, V>(this);
  }

  extend(kvs: [K, V][]) {
    for (let [k, v] of kvs) {
      this.set(k, v);
    }
  }
}

class UnorderedMapIterator<K, V> {
  private keys: VectorIterator<K>;
  private values: VectorIterator<V>;
  constructor(unorderedMap: UnorderedMap<K, V>) {
    this.keys = new VectorIterator(unorderedMap.keys);
    this.values = new VectorIterator(unorderedMap.values);
  }

  next(): { value: [K | null, V | null]; done: boolean } {
    let key = this.keys.next();
    let value = this.values.next();
    if (key.done != value.done) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }
    return { value: [key.value, value.value], done: key.done };
  }
}
