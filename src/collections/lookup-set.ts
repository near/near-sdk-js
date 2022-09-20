import * as near from "../api";
import { Bytes } from "../utils";

export class LookupSet<DataType> {
  constructor(readonly keyPrefix: Bytes) {}

  contains(key: DataType): boolean {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    return near.storageHasKey(storageKey);
  }

  // Returns true if the element was present in the set.
  remove(key: DataType): boolean {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    return near.storageRemove(storageKey);
  }

  // If the set did not have this value present, `true` is returned.
  // If the set did have this value present, `false` is returned.
  set(key: DataType): boolean {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    return !near.storageWrite(storageKey, "");
  }

  extend(keys: DataType[]): void {
    keys.forEach((key) => this.set(key));
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  // converting plain object to class object
  static reconstruct<DataType>(data: LookupSet<unknown>): LookupSet<DataType> {
    return new LookupSet(data.keyPrefix);
  }
}
