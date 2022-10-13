import * as near from "../api";
import { GetOptions } from "../types/collections";
import { Bytes, serializeValueWithOptions } from "../utils";

/**
 * A lookup set collection that stores entries in NEAR storage.
 */
export class LookupSet<DataType> {
  /**
   * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
   */
  constructor(readonly keyPrefix: Bytes) {}

  /**
   * Checks whether the collection contains the value.
   *
   * @param key - The value for which to check the presence.
   * @param options - Options for storing data.
   */
  contains(
    key: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const storageKey = this.keyPrefix + serializeValueWithOptions(key, options);
    return near.storageHasKey(storageKey);
  }

  /**
   * Returns true if the element was present in the set.
   *
   * @param key - The entry to remove.
   * @param options - Options for storing data.
   */
  remove(
    key: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const storageKey = this.keyPrefix + serializeValueWithOptions(key, options);
    return near.storageRemove(storageKey);
  }

  /**
   * If the set did not have this value present, `true` is returned.
   * If the set did have this value present, `false` is returned.
   *
   * @param key - The value to store in the collection.
   * @param options - Options for storing the data.
   */
  set(
    key: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const storageKey = this.keyPrefix + serializeValueWithOptions(key, options);
    return !near.storageWrite(storageKey, "");
  }

  /**
   * Extends the current collection with the passed in array of elements.
   *
   * @param keys - The elements to extend the collection with.
   * @param options - Options for storing the data.
   */
  extend(
    keys: DataType[],
    options?: Pick<GetOptions<DataType>, "serializer">
  ): void {
    keys.forEach((key) => this.set(key, options));
  }

  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options?: Pick<GetOptions<DataType>, "serializer">): string {
    return serializeValueWithOptions(this, options);
  }

  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct<DataType>(data: LookupSet<unknown>): LookupSet<DataType> {
    return new LookupSet(data.keyPrefix);
  }
}
