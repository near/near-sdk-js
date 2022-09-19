import * as near from "../api";
import { GetOptions } from "../types/collections";
import { Bytes } from "../utils";

export class LookupMap<DataType> {
  readonly keyPrefix: Bytes;

  constructor(keyPrefix: Bytes) {
    this.keyPrefix = keyPrefix;
  }

  containsKey(key: Bytes): boolean {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    return near.storageHasKey(storageKey);
  }

  get(key: Bytes, options?: GetOptions<DataType>): DataType | null {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    const raw = near.storageRead(storageKey);
    if (raw !== null) {
      const value = JSON.parse(raw);
      return options?.reconstructor
        ? options.reconstructor(value)
        : (value as DataType);
    }
    return null;
  }

  remove(key: Bytes): DataType | null {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    if (near.storageRemove(storageKey)) {
      return JSON.parse(near.storageGetEvicted());
    }
    return null;
  }

  set(key: Bytes, value: DataType): DataType | null {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    const storageValue = JSON.stringify(value);
    if (near.storageWrite(storageKey, storageValue)) {
      return JSON.parse(near.storageGetEvicted());
    }
    return null;
  }

  extend(objects: [Bytes, DataType][]) {
    for (const kv of objects) {
      this.set(kv[0], kv[1]);
    }
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  // converting plain object to class object
  static reconstruct<DataType>(data: LookupMap<DataType>): LookupMap<DataType> {
    return new LookupMap(data.keyPrefix);
  }
}
