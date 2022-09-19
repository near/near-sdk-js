import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array, Bytes } from "../utils";
import { Vector } from "./vector";
import { Mutable } from "../utils";

const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";

function serializeIndex(index: number) {
  const data = new Uint32Array([index]);
  const array = new Uint8Array(data.buffer);
  return u8ArrayToBytes(array);
}

function deserializeIndex(rawIndex: Bytes): number {
  const array = bytesToU8Array(rawIndex);
  const data = new Uint32Array(array.buffer);
  return data[0];
}

export class UnorderedSet<DataType> {
  readonly prefix: Bytes;
  readonly elementIndexPrefix: Bytes;
  readonly elements: Vector<DataType>;

  constructor(prefix: Bytes) {
    this.prefix = prefix;
    this.elementIndexPrefix = prefix + "i";
    const elementsPrefix = prefix + "e";
    this.elements = new Vector(elementsPrefix);
  }

  get length(): number {
    return this.elements.length;
  }

  isEmpty(): boolean {
    return this.elements.isEmpty();
  }

  contains(element: DataType): boolean {
    const indexLookup = this.elementIndexPrefix + JSON.stringify(element);
    return near.storageHasKey(indexLookup);
  }

  set(element: DataType): boolean {
    const indexLookup = this.elementIndexPrefix + JSON.stringify(element);
    if (near.storageRead(indexLookup)) {
      return false;
    } else {
      const nextIndex = this.length;
      const nextIndexRaw = serializeIndex(nextIndex);
      near.storageWrite(indexLookup, nextIndexRaw);
      this.elements.push(element);
      return true;
    }
  }

  remove(element: DataType): boolean {
    const indexLookup = this.elementIndexPrefix + JSON.stringify(element);
    const indexRaw = near.storageRead(indexLookup);
    if (indexRaw) {
      if (this.length == 1) {
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        near.storageRemove(indexLookup);
      } else {
        // If there is more than one element then swap remove swaps it with the last
        // element.
        const lastElement = this.elements.get(this.length - 1);
        if (!lastElement) {
          throw new Error(ERR_INCONSISTENT_STATE);
        }
        near.storageRemove(indexLookup);
        // If the removed element was the last element from keys, then we don't need to
        // reinsert the lookup back.
        if (lastElement != element) {
          const lastLookupElement =
            this.elementIndexPrefix + JSON.stringify(lastElement);
          near.storageWrite(lastLookupElement, indexRaw);
        }
      }
      const index = deserializeIndex(indexRaw);
      this.elements.swapRemove(index);
      return true;
    }
    return false;
  }

  clear() {
    for (const element of this.elements) {
      const indexLookup = this.elementIndexPrefix + JSON.stringify(element);
      near.storageRemove(indexLookup);
    }
    this.elements.clear();
  }

  toArray(): Bytes[] {
    const ret = [];
    for (const v of this) {
      ret.push(v);
    }
    return ret;
  }

  [Symbol.iterator]() {
    return this.elements[Symbol.iterator]();
  }

  extend(elements: DataType[]) {
    for (const element of elements) {
      this.set(element);
    }
  }

  serialize(): string {
    return JSON.stringify(this);
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
