import * as near from "../api";
import {
  assert,
  serializeValueWithOptions,
  ERR_INCONSISTENT_STATE,
  concat,
  bytes
} from "../utils";
import { Vector, VectorIterator } from "./vector";
import { Mutable } from "../utils";
import { GetOptions } from "../types/collections";

function serializeIndex(index: number) {
  const data = new Uint32Array([index]);
  const array = new Uint8Array(data.buffer);

  return array;
}

function deserializeIndex(rawIndex: Uint8Array): number {
  const [data] = new Uint32Array(rawIndex.buffer);

  return data;
}

/**
 * An unordered set that stores data in NEAR storage.
 */
export class UnorderedSet<DataType> {
  readonly elementIndexPrefix: Uint8Array;
  readonly elements: Vector<DataType>;

  /**
   * @param prefix - The byte prefix to use when storing elements inside this collection.
   */
  constructor(readonly prefix: Uint8Array) {
    this.elementIndexPrefix = concat(prefix, bytes("i"));
    this.elements = new Vector(concat(prefix, bytes("e")));
  }

  /**
   * The number of elements stored in the collection.
   */
  get length(): number {
    return this.elements.length;
  }

  /**
   * Checks whether the collection is empty.
   */
  isEmpty(): boolean {
    return this.elements.isEmpty();
  }

  /**
   * Checks whether the collection contains the value.
   *
   * @param element - The value for which to check the presence.
   * @param options - Options for storing data.
   */
  contains(
    element: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const indexLookup = concat(
      this.elementIndexPrefix,
      serializeValueWithOptions(element, options)
    );
    return near.storageHasKey(indexLookup);
  }

  /**
   * If the set did not have this value present, `true` is returned.
   * If the set did have this value present, `false` is returned.
   *
   * @param element - The value to store in the collection.
   * @param options - Options for storing the data.
   */
  set(
    element: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const indexLookup = concat(
      this.elementIndexPrefix,
      serializeValueWithOptions(element, options)
    );
    if (near.storageRead(indexLookup)) {
      return false;
    }

    const nextIndex = this.length;
    const nextIndexRaw = serializeIndex(nextIndex);
    near.storageWrite(indexLookup, nextIndexRaw);
    this.elements.push(element, options);

    return true;
  }

  /**
   * Returns true if the element was present in the set.
   *
   * @param element - The entry to remove.
   * @param options - Options for retrieving and storing data.
   */
  remove(element: DataType, options?: GetOptions<DataType>): boolean {
    const indexLookup = concat(
      this.elementIndexPrefix,
      serializeValueWithOptions(element, options)
    );

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
      const lastLookupElement = concat(
        this.elementIndexPrefix,
        serializeValueWithOptions(lastElement, options)
      );

      near.storageWrite(lastLookupElement, indexRaw);
    }

    const index = deserializeIndex(indexRaw);
    this.elements.swapRemove(index);

    return true;
  }

  /**
   * Remove all of the elements stored within the collection.
   */
  clear(options?: Pick<GetOptions<DataType>, "serializer">): void {
    for (const element of this.elements) {
      const indexLookup = concat(
        this.elementIndexPrefix,
        serializeValueWithOptions(element, options)
      );
      near.storageRemove(indexLookup);
    }

    this.elements.clear();
  }

  [Symbol.iterator](): VectorIterator<DataType> {
    return this.elements[Symbol.iterator]();
  }

  /**
   * Create a iterator on top of the default collection iterator using custom options.
   *
   * @param options - Options for retrieving and storing the data.
   */
  private createIteratorWithOptions(options?: GetOptions<DataType>): {
    [Symbol.iterator](): VectorIterator<DataType>;
  } {
    return {
      [Symbol.iterator]: () => new VectorIterator(this.elements, options),
    };
  }

  /**
   * Return a JavaScript array of the data stored within the collection.
   *
   * @param options - Options for retrieving and storing the data.
   */
  toArray(options?: GetOptions<DataType>): DataType[] {
    const array = [];

    const iterator = options ? this.createIteratorWithOptions(options) : this;

    for (const value of iterator) {
      array.push(value);
    }

    return array;
  }

  /**
   * Extends the current collection with the passed in array of elements.
   *
   * @param elements - The elements to extend the collection with.
   */
  extend(elements: DataType[]): void {
    for (const element of elements) {
      this.set(element);
    }
  }

  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options?: Pick<GetOptions<DataType>, "serializer">): Uint8Array {
    return serializeValueWithOptions(this, options);
  }

  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct<DataType>(
    data: UnorderedSet<DataType>
  ): UnorderedSet<DataType> {
    // removing readonly modifier
    type MutableUnorderedSet = Mutable<UnorderedSet<DataType>>;
    const set = new UnorderedSet(data.prefix) as MutableUnorderedSet;
    // reconstruct Vector
    const elementsPrefix = concat(data.prefix, bytes("e"));

    set.elements = new Vector(elementsPrefix);
    set.elements.length = data.elements.length;

    return set as UnorderedSet<DataType>;
  }
}
