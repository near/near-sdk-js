import { Bytes, Mutable } from "../utils";
import { Vector, VectorIterator } from "./vector";
import { LookupMap } from "./lookup-map";
import { GetOptions } from "../types/collections";

const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";

type ValueAndIndex<DataType> = [value: DataType, index: number];

export class UnorderedMap<DataType> {
  readonly prefix: Bytes;
  readonly keys: Vector<Bytes>;
  readonly values: LookupMap<ValueAndIndex<DataType>>;

  constructor(prefix: Bytes) {
    this.prefix = prefix;
    this.keys = new Vector<Bytes>(prefix + "u"); // intentional different prefix with old UnorderedMap
    this.values = new LookupMap<ValueAndIndex<DataType>>(prefix + "m");
  }

  get length() {
    const keysLen = this.keys.length;
    return keysLen;
  }

  isEmpty(): boolean {
    const keysIsEmpty = this.keys.isEmpty();
    return keysIsEmpty;
  }

  get(key: Bytes, options?: GetOptions<DataType>): DataType | null {
    const valueAndIndex = this.values.get(key);
    if (valueAndIndex === null) {
      return null;
    }
    const value = (valueAndIndex as ValueAndIndex<DataType>)[0];
    return options?.reconstructor ? options.reconstructor(value) : value;
  }

  set(key: Bytes, value: DataType): DataType | null {
    const valueAndIndex = this.values.get(key);
    if (valueAndIndex !== null) {
      const oldValue = (valueAndIndex as ValueAndIndex<DataType>)[0];
      (valueAndIndex as ValueAndIndex<DataType>)[0] = value;
      this.values.set(key, valueAndIndex);
      return oldValue as DataType;
    }

    const nextIndex = this.length;
    this.keys.push(key);
    this.values.set(key, [value, nextIndex]);
    return null;
  }

  remove(key: Bytes): DataType | null {
    const oldValueAndIndex = this.values.remove(key);
    if (oldValueAndIndex === null) {
      return null;
    }
    const index = (oldValueAndIndex as ValueAndIndex<DataType>)[1];
    if (this.keys.swapRemove(index) === null) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }

    // the last key is swapped to key[index], the corresponding [value, index] need update
    if (this.keys.length > 0 && index != this.keys.length) {
      // if there is still elements and it was not the last element
      const swappedKey = this.keys.get(index) as Bytes;
      const swappedValueAndIndex = this.values.get(swappedKey);
      if (swappedValueAndIndex === null) {
        throw new Error(ERR_INCONSISTENT_STATE);
      }
      this.values.set(swappedKey, [swappedValueAndIndex[0], index]);
    }
    return (oldValueAndIndex as ValueAndIndex<DataType>)[0];
  }

  clear() {
    for (const key of this.keys) {
      // Set instead of remove to avoid loading the value from storage.
      this.values.set(key as Bytes, null);
    }
    this.keys.clear();
  }

  toArray(): [Bytes, DataType][] {
    const ret = [];
    for (const v of this) {
      ret.push(v);
    }
    return ret;
  }

  [Symbol.iterator](): UnorderedMapIterator<DataType> {
    return new UnorderedMapIterator<DataType>(this);
  }

  extend(kvs: [Bytes, DataType][]) {
    for (const [k, v] of kvs) {
      this.set(k, v);
    }
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  // converting plain object to class object
  static reconstruct<DataType>(
    data: UnorderedMap<DataType>
  ): UnorderedMap<DataType> {
    // removing readonly modifier
    type MutableUnorderedMap = Mutable<UnorderedMap<DataType>>;
    const map = new UnorderedMap(data.prefix) as MutableUnorderedMap;
    // reconstruct keys Vector
    map.keys = new Vector(data.prefix + "u");
    map.keys.length = data.keys.length;
    // reconstruct values LookupMap
    map.values = new LookupMap(data.prefix + "m");
    return map as UnorderedMap<DataType>;
  }
}

class UnorderedMapIterator<DataType> {
  private keys: VectorIterator<Bytes>;
  private map: LookupMap<ValueAndIndex<DataType>>;

  constructor(unorderedMap: UnorderedMap<DataType>) {
    this.keys = new VectorIterator(unorderedMap.keys);
    this.map = unorderedMap.values;
  }

  next(): { value: [unknown | null, unknown | null]; done: boolean } {
    const key = this.keys.next();
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
