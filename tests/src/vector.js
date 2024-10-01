import { NearBindgen, call, view, Vector } from "near-sdk-js";
import { House, Room } from "./model.js";

/**
 * Simple contract used for testing the `vector`.
 * - Includes methods:
 *  - `len()` - Returns the current number of elements.
 *  - `isEmpty()` - Checks whether the collection is empty.
 *  - `get({ index })` - Get the value at the current index.
 *  - `push({ value })` - Adds data to the collection.
 *  - `pop()` - Removes and retrieves the element with the highest index..
 *  - `clear()` - Remove all of the elements stored within the collection.
 *  - `toArray()` - Return a JavaScript array of the data stored within the collection.
 *  - `extend({ kvs })` - Extends the current collection with the passed in array of elements.
 *  - `replace({ index, value })` - Replaces the data stored at the provided index with the provided data and returns the previously stored data.
 *  - `swapRemove({ index })` - Removes an element from the vector and returns it in serialized form.
 * The removed element is replaced by the last element of the vector.
 * Does not preserve ordering, but is `O(1)`.
 *  - `add_house()` - Store a new `House` object in the `unorderedMap` instance.
 *  - `get_house()` - Returns the `House` object at index `0`.
 * @param vector - Simple `Vector` used for testing.
 */
@NearBindgen({})
export class VectorTestContract {
  constructor() {
    this.vector = new Vector("a");
  }

  @view({})
  len() {
    return this.vector.length;
  }

  @view({})
  isEmpty() {
    return this.vector.isEmpty();
  }

  @view({})
  get({ index }) {
    return this.vector.get(index);
  }

  @call({})
  push({ value }) {
    this.vector.push(value);
  }

  @call({})
  pop() {
    this.vector.pop();
  }

  @call({})
  clear() {
    this.vector.clear();
  }

  @view({})
  toArray() {
    return this.vector.toArray();
  }

  @call({})
  extend({ kvs }) {
    this.vector.extend(kvs);
  }

  @call({})
  replace({ index, value }) {
    this.vector.replace(index, value);
  }

  @call({})
  swapRemove({ index }) {
    this.vector.swapRemove(index);
  }

  @call({})
  add_house() {
    this.vector.push(
      new House("house1", [
        new Room("room1", "200sqft"),
        new Room("room2", "300sqft"),
      ])
    );
  }

  @view({})
  get_house() {
    return this.vector.get(0);
  }
}
