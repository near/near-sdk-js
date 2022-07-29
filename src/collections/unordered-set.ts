import * as near from "../api";
import { u8ArrayToBytes, bytesToU8Array, Bytes, ClassMap } from "../utils";
import { Vector } from "./vector";
import { Serializer } from 'superserial';

const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";

export class UnorderedSet<E> {
  readonly length: number;
  readonly elementIndexPrefix: Bytes;
  readonly elements: Vector<E>;
  readonly serializer: Serializer;

  constructor(prefix: Bytes, classes?: ClassMap) {
    this.length = 0;
    this.elementIndexPrefix = prefix + "i";
    let elementsPrefix = prefix + "e";
    this.elements = new Vector(elementsPrefix, classes);
    this.serializer = new Serializer({classes});
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

  contains(element: E): boolean {
    let indexLookup = this.elementIndexPrefix + this.serializer.serialize(element);
    return near.storageHasKey(indexLookup);
  }

  set(element: E): boolean {
    let indexLookup = this.elementIndexPrefix + this.serializer.serialize(element);
    if (near.storageRead(indexLookup)) {
      return false;
    } else {
      let nextIndex = this.len();
      let nextIndexRaw = this.serializeIndex(nextIndex);
      near.storageWrite(indexLookup, nextIndexRaw);
      this.elements.push(element);
      return true;
    }
  }

  remove(element: E): boolean {
    let indexLookup = this.elementIndexPrefix + this.serializer.serialize(element);
    let indexRaw = near.storageRead(indexLookup);
    if (indexRaw) {
      if (this.len() == 1) {
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        near.storageRemove(indexLookup);
      } else {
        // If there is more than one element then swap remove swaps it with the last
        // element.
        let lastElement = this.elements.get(this.len() - 1);
        if (!lastElement) {
          throw new Error(ERR_INCONSISTENT_STATE);
        }
        near.storageRemove(indexLookup);
        // If the removed element was the last element from keys, then we don't need to
        // reinsert the lookup back.
        if (lastElement != element) {
          let lastLookupElement = this.elementIndexPrefix + this.serializer.serialize(lastElement);
          near.storageWrite(lastLookupElement, indexRaw);
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
      let indexLookup = this.elementIndexPrefix + this.serializer.serialize(element);
      near.storageRemove(indexLookup);
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

  extend(elements: E[]) {
    for (let element of elements) {
      this.set(element);
    }
  }
}
