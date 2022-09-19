import * as near from "../api";
import { Bytes } from "../utils";

export class LookupSet {
  readonly keyPrefix: Bytes;

  constructor(keyPrefix: Bytes) {
    this.keyPrefix = keyPrefix;
  }

  contains(key: Bytes): boolean {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    return near.storageHasKey(storageKey);
  }

  // Returns true if the element was present in the set.
  remove(key: Bytes): boolean {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    return near.storageRemove(storageKey);
  }

  // If the set did not have this value present, `true` is returned.
  // If the set did have this value present, `false` is returned.
  set(key: Bytes): boolean {
    const storageKey = this.keyPrefix + JSON.stringify(key);
    return !near.storageWrite(storageKey, "");
  }

  extend(keys: Bytes[]) {
    for (const key of keys) {
      this.set(key);
    }
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  // converting plain object to class object
  static reconstruct(data: LookupSet): LookupSet {
    return new LookupSet(data.keyPrefix);
  }
}
