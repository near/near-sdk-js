import * as near from "../api";
import { GetOptions } from "../types/collections";
import { Bytes, getValueWithOptions } from "../utils";

export class LookupMap<DataType> {
  constructor(readonly keyPrefix: Bytes) {}

  containsKey(key: Bytes): boolean {
    const storageKey = this.keyPrefix + key;
    return near.storageHasKey(storageKey);
  }

  get(key: Bytes, options?: GetOptions<DataType>): DataType | null {
    const storageKey = this.keyPrefix + key;
    const value = JSON.parse(near.storageRead(storageKey));

    return getValueWithOptions(value, options);
  }

  remove(key: Bytes, options?: GetOptions<DataType>): DataType | null {
    const storageKey = this.keyPrefix + key;

    if (!near.storageRemove(storageKey)) {
      return options?.defaultValue ?? null;
    }

    const value = JSON.parse(near.storageGetEvicted());

    return getValueWithOptions(value, options);
  }

  set(
    key: Bytes,
    newValue: DataType,
    options?: GetOptions<DataType>
  ): DataType | null {
    const storageKey = this.keyPrefix + key;
    const storageValue = JSON.stringify(newValue);

    if (!near.storageWrite(storageKey, storageValue)) {
      return options?.defaultValue ?? null;
    }

    const value = JSON.parse(near.storageGetEvicted());

    return getValueWithOptions(value, options);
  }

  extend(
    keyValuePairs: [Bytes, DataType][],
    options?: GetOptions<DataType>
  ): void {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value, options);
    }
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  // converting plain object to class object
  static reconstruct<DataType>(data: LookupMap<unknown>): LookupMap<DataType> {
    return new LookupMap(data.keyPrefix);
  }
}
