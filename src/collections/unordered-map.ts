import { Bytes, Mutable } from "../utils";
import { Vector, VectorIterator } from "./vector";
import { LookupMap } from "./lookup-map";

const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";

type ValueAndIndex = [value: unknown, index: number]

export class UnorderedMap {
  readonly prefix: Bytes;
  readonly keys: Vector;
  readonly values: LookupMap;

  constructor(prefix: Bytes) {
    this.prefix = prefix;
    this.keys = new Vector(prefix + 'u'); // intentional different prefix with old UnorderedMap
    this.values = new LookupMap(prefix + 'm');
  }

  get length() {
    let keysLen = this.keys.length;
    return keysLen;
  }

  isEmpty(): boolean {
    let keysIsEmpty = this.keys.isEmpty();
    return keysIsEmpty;
  }

  get(key: Bytes): unknown | null {
    let valueAndIndex = this.values.get(key);
    if (valueAndIndex === null) {
      return null;
    }
    let value = (valueAndIndex as ValueAndIndex)[0];
    return value;
  }

  set(key: Bytes, value: unknown): unknown | null {
    let valueAndIndex = this.values.get(key);
    if (valueAndIndex !== null) {
      let oldValue = (valueAndIndex as ValueAndIndex)[0];
      (valueAndIndex as ValueAndIndex)[0] = value;
      this.values.set(key, valueAndIndex)
      return oldValue;
    }

    let nextIndex = this.length;
    this.keys.push(key);
    this.values.set(key, [value, nextIndex]);
    return null;
  }

  remove(key: Bytes): unknown | null {
    let oldValueAndIndex = this.values.remove(key);
    if (oldValueAndIndex === null) {
      return null;
    }
    let index = (oldValueAndIndex as ValueAndIndex)[1];
    if (this.keys.swapRemove(index) === null) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }

    // the last key is swapped to key[index], the corresponding [value, index] need update
    if (this.keys.length > 0 && index != this.keys.length) {
      // if there is still elements and it was not the last element
      let swappedKey = this.keys.get(index) as Bytes;
      let swappedValueAndIndex = this.values.get(swappedKey);
      if (swappedValueAndIndex === null) {
        throw new Error(ERR_INCONSISTENT_STATE)
      }
      this.values.set(swappedKey, [swappedValueAndIndex[0], index])
    }
    return (oldValueAndIndex as ValueAndIndex)[0];
  }

  clear() {
    for (let key of this.keys) {
      // Set instead of remove to avoid loading the value from storage.
      this.values.set(key as Bytes, null);
    }
    this.keys.clear();
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
    // reconstruct keys Vector
    map.keys = new Vector(data.prefix + "u");
    map.keys.length = data.keys.length;
    // reconstruct values LookupMap
    map.values = new LookupMap(data.prefix + "m");
    return map as UnorderedMap;
  }
}

class UnorderedMapIterator {
  private keys: VectorIterator;
  private map: LookupMap;

  constructor(unorderedMap: UnorderedMap) {
    this.keys = new VectorIterator(unorderedMap.keys);
    this.map = unorderedMap.values;
  }

  next(): { value: [unknown | null, unknown | null]; done: boolean } {
    let key = this.keys.next();
    let value;
    if (!key.done) {
      value = this.map.get(key.value as Bytes);
      if (value === null) {
        throw new Error(ERR_INCONSISTENT_STATE);
      }
    }
    return { value: [key.value, value ? value[0] : value], done: key.done };
  }
}
