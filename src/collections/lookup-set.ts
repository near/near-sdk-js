import * as near from "../api";
import { GetOptions } from "../types/collections";
import { Bytes, serializeValueWithOptions } from "../utils";

export class LookupSet<DataType> {
  constructor(readonly keyPrefix: Bytes) {}

  contains(
    key: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const storageKey = this.keyPrefix + serializeValueWithOptions(key, options);
    return near.storageHasKey(storageKey);
  }

  // Returns true if the element was present in the set.
  remove(
    key: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const storageKey = this.keyPrefix + serializeValueWithOptions(key, options);
    return near.storageRemove(storageKey);
  }

  // If the set did not have this value present, `true` is returned.
  // If the set did have this value present, `false` is returned.
  set(
    key: DataType,
    options?: Pick<GetOptions<DataType>, "serializer">
  ): boolean {
    const storageKey = this.keyPrefix + serializeValueWithOptions(key, options);
    return !near.storageWrite(storageKey, "");
  }

  extend(
    keys: DataType[],
    options?: Pick<GetOptions<DataType>, "serializer">
  ): void {
    keys.forEach((key) => this.set(key, options));
  }

  serialize(options?: Pick<GetOptions<DataType>, "serializer">): string {
    return serializeValueWithOptions(this, options);
  }

  // converting plain object to class object
  static reconstruct<DataType>(data: LookupSet<unknown>): LookupSet<DataType> {
    return new LookupSet(data.keyPrefix);
  }
}
