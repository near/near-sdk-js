import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array, Bytes } from "../utils";
import { Vector } from "./vector";

const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";

export class UnorderedSet {
  readonly length: number;
  readonly elementIndexPrefix: Bytes;
  readonly elements: Vector;

  constructor(prefix: Bytes) {
    this.length = 0;
    this.elementIndexPrefix = prefix + "i";
    let elementsPrefix = prefix + "e";
    this.elements = new Vector(elementsPrefix);
  }

  len(): number {
    return this.elements.len();
  }

  isEmpty(): boolean {
    return this.elements.isEmpty();
  }

  serializeIndex(index: number) {
    let data = new Uint32Array([index]);
    let array = new Uint8Array(data.buffer);
    return u8ArrayToBytes(array);
  }

  deserializeIndex(rawIndex: Bytes): number {
    let array = bytesToU8Array(rawIndex);
    let data = new Uint32Array(array.buffer);
    return data[0];
  }

  contains(element: Bytes): boolean {
    let indexLookup = this.elementIndexPrefix + element;
    return near.jsvmStorageHasKey(indexLookup);
  }

  set(element: Bytes): boolean {
    let indexLookup = this.elementIndexPrefix + element;
    if (near.jsvmStorageRead(indexLookup)) {
      return false;
    } else {
      let nextIndex = this.len();
      let nextIndexRaw = this.serializeIndex(nextIndex);
      near.jsvmStorageWrite(indexLookup, nextIndexRaw);
      this.elements.push(element);
      return true;
    }
  }

  remove(element: Bytes): boolean {
    let indexLookup = this.elementIndexPrefix + element;
    let indexRaw = near.jsvmStorageRead(indexLookup);
    if (indexRaw) {
      if (this.len() == 1) {
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        near.jsvmStorageRemove(indexLookup);
      } else {
        // If there is more than one element then swap remove swaps it with the last
        // element.
        let lastElementRaw = this.elements.get(this.len() - 1);
        if (!lastElementRaw) {
          throw new Error(ERR_INCONSISTENT_STATE);
        }
        near.jsvmStorageRemove(indexLookup);
        // If the removed element was the last element from keys, then we don't need to
        // reinsert the lookup back.
        if (lastElementRaw != element) {
          let lastLookupElement = this.elementIndexPrefix + lastElementRaw;
          near.jsvmStorageWrite(lastLookupElement, indexRaw);
        }
      }
      let index = this.deserializeIndex(indexRaw);
      this.elements.swapRemove(index);
      return true;
    }
    return false;
  }

  clear() {
    for (let element of this.elements) {
      let indexLookup = this.elementIndexPrefix + element;
      near.jsvmStorageRemove(indexLookup);
    }
    this.elements.clear();
  }

  toArray(): Bytes[] {
    let ret = [];
    for (let v of this) {
      ret.push(v);
    }
    return ret;
  }

  [Symbol.iterator]() {
    return this.elements[Symbol.iterator]();
  }

  extend(elements: Bytes[]) {
    for (let element of elements) {
      this.set(element);
    }
  }
}
