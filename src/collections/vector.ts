import * as near from "../api";
import { Bytes, u8ArrayToBytes } from "../utils";
import { GetOptions } from "../types/collections";
const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";

function indexToKey(prefix: Bytes, index: number): Bytes {
  const data = new Uint32Array([index]);
  const array = new Uint8Array(data.buffer);
  const key = u8ArrayToBytes(array);
  return prefix + key;
}

/// An iterable implementation of vector that stores its content on the trie.
/// Uses the following map: index -> element
export class Vector<DataType> {
  length: number;
  readonly prefix: Bytes;

  constructor(prefix: Bytes) {
    this.length = 0;
    this.prefix = prefix;
  }

  isEmpty(): boolean {
    return this.length == 0;
  }

  get(index: number, options?: GetOptions<DataType>): DataType | null {
    if (index >= this.length) {
      return null;
    }
    const storageKey = indexToKey(this.prefix, index);
    const value = JSON.parse(near.storageRead(storageKey));
    return options?.reconstructor
      ? options.reconstructor(value)
      : (value as DataType);
  }

  /// Removes an element from the vector and returns it in serialized form.
  /// The removed element is replaced by the last element of the vector.
  /// Does not preserve ordering, but is `O(1)`.
  swapRemove(index: number): unknown | null {
    if (index >= this.length) {
      throw new Error(ERR_INDEX_OUT_OF_BOUNDS);
    } else if (index + 1 == this.length) {
      return this.pop();
    } else {
      const key = indexToKey(this.prefix, index);
      const last = this.pop();
      if (near.storageWrite(key, JSON.stringify(last))) {
        return JSON.parse(near.storageGetEvicted());
      } else {
        throw new Error(ERR_INCONSISTENT_STATE);
      }
    }
  }

  push(element: DataType) {
    const key = indexToKey(this.prefix, this.length);
    this.length += 1;
    near.storageWrite(key, JSON.stringify(element));
  }

  pop(): DataType | null {
    if (this.isEmpty()) {
      return null;
    } else {
      const lastIndex = this.length - 1;
      const lastKey = indexToKey(this.prefix, lastIndex);
      this.length -= 1;
      if (near.storageRemove(lastKey)) {
        return JSON.parse(near.storageGetEvicted());
      } else {
        throw new Error(ERR_INCONSISTENT_STATE);
      }
    }
  }

  replace(index: number, element: DataType): DataType {
    if (index >= this.length) {
      throw new Error(ERR_INDEX_OUT_OF_BOUNDS);
    } else {
      const key = indexToKey(this.prefix, index);
      if (near.storageWrite(key, JSON.stringify(element))) {
        return JSON.parse(near.storageGetEvicted());
      } else {
        throw new Error(ERR_INCONSISTENT_STATE);
      }
    }
  }

  extend(elements: DataType[]) {
    for (const element of elements) {
      this.push(element);
    }
  }

  [Symbol.iterator](): VectorIterator<DataType> {
    return new VectorIterator(this);
  }

  clear() {
    for (let i = 0; i < this.length; i++) {
      const key = indexToKey(this.prefix, i);
      near.storageRemove(key);
    }
    this.length = 0;
  }

  toArray(): DataType[] {
    const ret = [];
    for (const v of this) {
      ret.push(v);
    }
    return ret;
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  // converting plain object to class object
  static reconstruct<DataType>(data: Vector<DataType>): Vector<DataType> {
    const vector = new Vector<DataType>(data.prefix);
    vector.length = data.length;
    return vector;
  }
}

export class VectorIterator<DataType> {
  private current: number;
  private vector: Vector<DataType>;
  constructor(vector: Vector<DataType>) {
    this.current = 0;
    this.vector = vector;
  }

  next(): { value: unknown | null; done: boolean } {
    if (this.current < this.vector.length) {
      const value = this.vector.get(this.current);
      this.current += 1;
      return { value, done: false };
    }
    return { value: null, done: true };
  }
}
