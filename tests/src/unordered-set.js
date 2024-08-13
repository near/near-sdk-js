import { NearBindgen, call, view, UnorderedSet } from "near-sdk-js";
import { House, Room } from "./model.js";

/**
 * Simple contract used for testing the `unorderedSet`.
 * - Includes methods:
 *  - `len()` - Returns the current number of elements present in the set.
 *  - `isEmpty()` - Checks whether the collection is empty.
 *  - `contains({ element })` - Checks whether the collection contains the value.
 *  - `set({ element }) ` - Store a new value at the provided key.
 *  - `remove_key({ element })` - Removes and retrieves the element.
 *  - `clear()` - Remove all of the elements stored within the collection.
 *  - `toArray()` - Return a JavaScript array of the data stored within the collection.
 *  - `elements({ start, limit })` - Converts the deserialized data from storage to a JavaScript instance of the collection.
 *  - `extend({ elements })` - Extends the current collection with the passed in array of elements.
 *  - `add_house({ name, rooms })` - Store a new `House` object in the `unorderedMap` instance.
 *  - `house_exist({ name, rooms })` - Checks whether the collection contains the passed `House` object.
 * @param unorderedSet - Simple `UnorderedSet` used for testing.
 */
@NearBindgen({})
export class UnorderedSetTestContract {
  constructor() {
    this.unorderedSet = new UnorderedSet("a");
  }

  @view({})
  len() {
    return this.unorderedSet.length;
  }

  @view({})
  isEmpty() {
    return this.unorderedSet.isEmpty();
  }

  @view({})
  contains({ element }) {
    return this.unorderedSet.contains(element);
  }

  @call({})
  set({ element }) {
    this.unorderedSet.set(element);
  }

  @call({})
  remove_key({ element }) {
    this.unorderedSet.remove(element);
  }

  @call({})
  clear() {
    this.unorderedSet.clear();
  }

  @view({})
  toArray() {
    const res = this.unorderedSet.toArray();
    return res;
  }

  @view({})
  elements({ start, limit }) {
    return this.unorderedSet.elements({ start, limit });
  }

  @call({})
  extend({ elements }) {
    this.unorderedSet.extend(elements);
  }

  @call({})
  add_house({ name, rooms }) {
    let house = new House(name, []);
    for (let r of rooms) {
      house.rooms.push(new Room(r.name, r.size));
    }
    this.unorderedSet.set(house);
  }

  @view({})
  house_exist({ name, rooms }) {
    let house = new House(name, []);
    for (let r of rooms) {
      house.rooms.push(new Room(r.name, r.size));
    }
    return this.unorderedSet.contains(house);
  }
}
