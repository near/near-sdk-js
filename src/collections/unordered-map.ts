import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array, Bytes, Mutable } from "../utils";
import { Vector, VectorIterator } from "./vector";

const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";

function serializeIndex(index: number): Bytes {
  let data = new Uint32Array([index]);
  let array = new Uint8Array(data.buffer);
  return u8ArrayToBytes(array);
}

function deserializeIndex(rawIndex: Bytes) {
  let array = bytesToU8Array(rawIndex);
  let data = new Uint32Array(array.buffer);
  return data[0];
}

function getIndexRaw(keyIndexPrefix: Bytes, key: Bytes): Bytes {
  let indexLookup = keyIndexPrefix + JSON.stringify(key);
  let indexRaw = near.storageRead(indexLookup);
  return indexRaw;
}

export class UnorderedMap {
  readonly length: number;
  readonly prefix: Bytes;
  readonly keyIndexPrefix: Bytes;
  readonly keys: Vector;
  readonly values: Vector;

  constructor(prefix: Bytes) {
    this.length = 0;
    this.prefix = prefix;
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

  isEmpty(): boolean {
    let keysIsEmpty = this.keys.isEmpty();
    let valuesIsEmpty = this.values.isEmpty();
    if (keysIsEmpty != valuesIsEmpty) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }
    return keysIsEmpty;
  }

  get(key: Bytes): unknown | null {
    let indexRaw = getIndexRaw(this.keyIndexPrefix, key);
    if (indexRaw) {
      let index = deserializeIndex(indexRaw);
      let value = this.values.get(index);
      if (value) {
        return value;
      } else {
        throw new Error(ERR_INCONSISTENT_STATE);
      }
    }
    return null;
  }

  set(key: Bytes, value: unknown): unknown | null {
    let indexLookup = this.keyIndexPrefix + JSON.stringify(key);
    let indexRaw = near.storageRead(indexLookup);
    if (indexRaw) {
      let index = deserializeIndex(indexRaw);
      return this.values.replace(index, value);
    } else {
      let nextIndex = this.len();
      let nextIndexRaw = serializeIndex(nextIndex);
      near.storageWrite(indexLookup, nextIndexRaw);
      this.keys.push(key);
      this.values.push(value);
      return null;
    }
  }

  remove(key: Bytes): unknown | null {
    let indexLookup = this.keyIndexPrefix + JSON.stringify(key);
    let indexRaw = near.storageRead(indexLookup);
    if (indexRaw) {
      if (this.len() == 1) {
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        near.storageRemove(indexLookup);
      } else {
        // If there is more than one element then swap remove swaps it with the last
        // element.
        let lastKey = this.keys.get(this.len() - 1);
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

  toArray(): [Bytes, unknown][] {
    let ret = [];
    for (let v of this) {
      ret.push(v);
    }
    return ret;
  }

  [Symbol.iterator](): UnorderedMapIterator {
    return new UnorderedMapIterator(this);
  }

  extend(kvs: [Bytes, unknown][]) {
    for (let [k, v] of kvs) {
      this.set(k, v);
    }
  }

  serialize(): string {
    return JSON.stringify(this)
  }

  // converting plain object to class object
  static deserialize(data: UnorderedMap): UnorderedMap {
    // removing readonly modifier
    type MutableUnorderedMap = Mutable<UnorderedMap>;
    let map = new UnorderedMap(data.prefix) as MutableUnorderedMap;
    // reconstruct UnorderedMap
    map.length = data.length;
    // reconstruct keys Vector
    map.keys = new Vector(data.prefix + "k");
    map.keys.length = data.keys.length;
    // reconstruct values Vector
    map.values = new Vector(data.prefix + "v");
    map.values.length = data.values.length;
    return map as UnorderedMap;
  }
}

class UnorderedMapIterator {
  private keys: VectorIterator;
  private values: VectorIterator;
  constructor(unorderedMap: UnorderedMap) {
    this.keys = new VectorIterator(unorderedMap.keys);
    this.values = new VectorIterator(unorderedMap.values);
  }

  next(): { value: [unknown | null, unknown | null]; done: boolean } {
    let key = this.keys.next();
    let value = this.values.next();
    if (key.done != value.done) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }
    return { value: [key.value, value.value], done: key.done };
  }
}
