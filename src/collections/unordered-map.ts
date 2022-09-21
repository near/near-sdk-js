import {
  assert,
  Bytes,
  ERR_INCONSISTENT_STATE,
  getValueWithOptions,
  Mutable,
  serializeValueWithOptions,
} from "../utils";
import { Vector, VectorIterator } from "./vector";
import { LookupMap } from "./lookup-map";
import { GetOptions } from "../types/collections";

type ValueAndIndex = [value: string, index: number];

export class UnorderedMap<DataType> {
  readonly keys: Vector<Bytes>;
  readonly values: LookupMap<ValueAndIndex>;

  constructor(readonly prefix: Bytes) {
    this.keys = new Vector<Bytes>(`${prefix}u`); // intentional different prefix with old UnorderedMap
    this.values = new LookupMap<ValueAndIndex>(`${prefix}m`);
  }

  get length() {
    return this.keys.length;
  }

  isEmpty(): boolean {
    return this.keys.isEmpty();
  }

  get(key: Bytes, options?: GetOptions<DataType>): DataType | null {
    const valueAndIndex = this.values.get(key);

    if (valueAndIndex === null) {
      return options?.defaultValue ?? null;
    }

    const [value] = valueAndIndex;

    return getValueWithOptions(value, options);
  }

  set(
    key: Bytes,
    value: DataType,
    options?: GetOptions<DataType>
  ): DataType | null {
    const valueAndIndex = this.values.get(key);
    const serialized = serializeValueWithOptions(value, options);

    if (valueAndIndex === null) {
      const newElementIndex = this.length;

      this.keys.push(key);
      this.values.set(key, [serialized, newElementIndex]);

      return null;
    }

    const [oldValue, oldIndex] = valueAndIndex;
    this.values.set(key, [serialized, oldIndex]);

    return getValueWithOptions(oldValue, options);
  }

  remove(key: Bytes, options?: GetOptions<DataType>): DataType | null {
    const oldValueAndIndex = this.values.remove(key);

    if (oldValueAndIndex === null) {
      return options?.defaultValue ?? null;
    }

    const [value, index] = oldValueAndIndex;

    assert(this.keys.swapRemove(index) !== null, ERR_INCONSISTENT_STATE);

    // the last key is swapped to key[index], the corresponding [value, index] need update
    if (!this.keys.isEmpty() && index !== this.keys.length) {
      // if there is still elements and it was not the last element
      const swappedKey = this.keys.get(index);
      const swappedValueAndIndex = this.values.get(swappedKey);

      assert(swappedValueAndIndex !== null, ERR_INCONSISTENT_STATE);

      this.values.set(swappedKey, [swappedValueAndIndex[0], index]);
    }

    return getValueWithOptions(value, options);
  }

  clear(): void {
    for (const key of this.keys) {
      // Set instead of remove to avoid loading the value from storage.
      this.values.set(key, null);
    }

    this.keys.clear();
  }

  [Symbol.iterator](): UnorderedMapIterator<DataType> {
    return new UnorderedMapIterator<DataType>(this);
  }

  private createIteratorWithOptions(options?: GetOptions<DataType>): {
    [Symbol.iterator](): UnorderedMapIterator<DataType>;
  } {
    return {
      [Symbol.iterator]: () => new UnorderedMapIterator(this, options),
    };
  }

  toArray(options?: GetOptions<DataType>): [Bytes, DataType][] {
    const array = [];

    const iterator = options ? this.createIteratorWithOptions(options) : this;

    for (const value of iterator) {
      array.push(value);
    }

    return array;
  }

  extend(keyValuePairs: [Bytes, DataType][]) {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value);
    }
  }

  serialize(options?: Pick<GetOptions<DataType>, "serializer">): string {
    return serializeValueWithOptions(this, options);
  }

  // converting plain object to class object
  static reconstruct<DataType>(
    data: UnorderedMap<DataType>
  ): UnorderedMap<DataType> {
    // removing readonly modifier
    type MutableUnorderedMap = Mutable<UnorderedMap<DataType>>;
    const map = new UnorderedMap(data.prefix) as MutableUnorderedMap;

    // reconstruct keys Vector
    map.keys = new Vector(`${data.prefix}u`);
    map.keys.length = data.keys.length;
    // reconstruct values LookupMap
    map.values = new LookupMap(`${data.prefix}m`);

    return map as UnorderedMap<DataType>;
  }
}

class UnorderedMapIterator<DataType> {
  private keys: VectorIterator<Bytes>;
  private map: LookupMap<ValueAndIndex>;

  constructor(
    unorderedMap: UnorderedMap<DataType>,
    private options?: GetOptions<DataType>
  ) {
    this.keys = new VectorIterator(unorderedMap.keys);
    this.map = unorderedMap.values;
  }

  next(): { value: [Bytes | null, DataType | null]; done: boolean } {
    const key = this.keys.next();

    if (key.done) {
      return { value: [key.value, null], done: key.done };
    }

    const valueAndIndex = this.map.get(key.value);

    assert(valueAndIndex !== null, ERR_INCONSISTENT_STATE);

    return {
      done: key.done,
      value: [key.value, getValueWithOptions(valueAndIndex[0], this.options)],
    };
  }
}
