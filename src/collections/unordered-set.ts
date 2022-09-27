import * as near from "../api";
import {
  u8ArrayToBytes,
  bytesToU8Array,
  Bytes,
  assert,
  serializeValueWithOptions,
  ERR_INCONSISTENT_STATE,
} from "../utils";
import { Vector, VectorIterator } from "./vector";
import { Mutable } from "../utils";
import { GetOptions } from "../types/collections";

function serializeIndex(index: number) {
  const data = new Uint32Array([index]);
  const array = new Uint8Array(data.buffer);

  return u8ArrayToBytes(array);
}

function deserializeIndex(rawIndex: Bytes): number {
  const array = bytesToU8Array(rawIndex);
  const [data] = new Uint32Array(array.buffer);

  return data;
}

export class UnorderedSet<DataType> {
  readonly elementIndexPrefix: Bytes;
  readonly elements: Vector<DataType>;

  constructor(readonly prefix: Bytes) {
    this.elementIndexPrefix = `${prefix}i`;
    this.elements = new Vector(`${prefix}e`);
  }

  get length(): number {
    return this.elements.length;
  }

  isEmpty(): boolean {
    return this.elements.isEmpty();
  }

  contains(
    element: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const indexLookup =
      this.elementIndexPrefix + serializeValueWithOptions(element, options);
    return near.storageHasKey(indexLookup);
  }

  set(
    element: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const indexLookup =
      this.elementIndexPrefix + serializeValueWithOptions(element, options);

    if (near.storageRead(indexLookup)) {
      return false;
    }

    const nextIndex = this.length;
    const nextIndexRaw = serializeIndex(nextIndex);
    near.storageWrite(indexLookup, nextIndexRaw);
    this.elements.push(element, options);

    return true;
  }

  remove(element: DataType, options?: GetOptions<DataType>): boolean {
    const indexLookup =
      this.elementIndexPrefix + serializeValueWithOptions(element, options);
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
      const lastLookupElement =
        this.elementIndexPrefix +
        serializeValueWithOptions(lastElement, options);
      near.storageWrite(lastLookupElement, indexRaw);
    }

    const index = deserializeIndex(indexRaw);
    this.elements.swapRemove(index);

    return true;
  }

  clear(options?: Pick<GetOptions<DataType>, "serializer">): void {
    for (const element of this.elements) {
      const indexLookup =
        this.elementIndexPrefix + serializeValueWithOptions(element, options);
      near.storageRemove(indexLookup);
    }

    this.elements.clear();
  }

  [Symbol.iterator](): VectorIterator<DataType> {
    return this.elements[Symbol.iterator]();
  }

  private createIteratorWithOptions(options?: GetOptions<DataType>): {
    [Symbol.iterator](): VectorIterator<DataType>;
  } {
    return {
      [Symbol.iterator]: () => new VectorIterator(this.elements, options),
    };
  }

  toArray(options?: GetOptions<DataType>): DataType[] {
    const array = [];

    const iterator = options ? this.createIteratorWithOptions(options) : this;

    for (const value of iterator) {
      array.push(value);
    }

    return array;
  }

  extend(elements: DataType[]): void {
    for (const element of elements) {
      this.set(element);
    }
  }

  serialize(options?: Pick<GetOptions<DataType>, "serializer">): string {
    return serializeValueWithOptions(this, options);
  }

  // converting plain object to class object
  static reconstruct<DataType>(
    data: UnorderedSet<DataType>
  ): UnorderedSet<DataType> {
    // removing readonly modifier
    type MutableUnorderedSet = Mutable<UnorderedSet<DataType>>;
    const set = new UnorderedSet(data.prefix) as MutableUnorderedSet;
    // reconstruct Vector
    const elementsPrefix = data.prefix + "e";
    set.elements = new Vector(elementsPrefix);
    set.elements.length = data.elements.length;

    return set as UnorderedSet<DataType>;
  }
}
