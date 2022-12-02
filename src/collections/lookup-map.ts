import * as near from "../api";
import { GetOptions } from "../types/collections";
import {
  getValueWithOptions,
  serializeValueWithOptions,
  concat,
} from "../utils";

/**
 * A lookup map that stores data in NEAR storage.
 */
export class LookupMap<DataType> {
  /**
   * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
   */
  constructor(readonly keyPrefix: Uint8Array) {}

  /**
   * Checks whether the collection contains the value.
   *
   * @param key - The value for which to check the presence.
   */
  containsKey(key: Uint8Array): boolean {
    const storageKey = concat(this.keyPrefix, key);
    return near.storageHasKey(storageKey);
  }

  /**
   * Get the data stored at the provided key.
   *
   * @param key - The key at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(
    key: Uint8Array,
    options?: Omit<GetOptions<DataType>, "serializer">
  ): DataType | null {
    const storageKey = concat(this.keyPrefix, key);
    const value = near.storageRead(storageKey);

    return getValueWithOptions(value, options);
  }

  /**
   * Removes and retrieves the element with the provided key.
   *
   * @param key - The key at which to remove data.
   * @param options - Options for retrieving the data.
   */
  remove(
    key: Uint8Array,
    options?: Omit<GetOptions<DataType>, "serializer">
  ): DataType | null {
    const storageKey = concat(this.keyPrefix, key);

    if (!near.storageRemove(storageKey)) {
      return options?.defaultValue ?? null;
    }

    const value = near.storageGetEvicted();

    return getValueWithOptions(value, options);
  }

  /**
   * Store a new value at the provided key.
   *
   * @param key - The key at which to store in the collection.
   * @param newValue - The value to store in the collection.
   * @param options - Options for retrieving and storing the data.
   */
  set(
    key: Uint8Array,
    newValue: DataType,
    options?: GetOptions<DataType>
  ): DataType | null {
    const storageKey = concat(this.keyPrefix, key);
    const storageValue = serializeValueWithOptions(newValue, options);

    if (!near.storageWrite(storageKey, storageValue)) {
      return options?.defaultValue ?? null;
    }

    const value = near.storageGetEvicted();

    return getValueWithOptions(value, options);
  }

  /**
   * Extends the current collection with the passed in array of key-value pairs.
   *
   * @param keyValuePairs - The key-value pairs to extend the collection with.
   * @param options - Options for storing the data.
   */
  extend(
    keyValuePairs: [Uint8Array, DataType][],
    options?: GetOptions<DataType>
  ): void {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value, options);
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
  static reconstruct<DataType>(data: LookupMap<unknown>): LookupMap<DataType> {
    return new LookupMap(data.keyPrefix);
  }
}
