import { NearBindgen, call, view, UnorderedMap } from "near-sdk-js";
import { House, Room } from "./model.js";

/**
 * Simple contract used for testing the `unorderedMap`.
 * - Includes methods:
 *  - `len()` - Returns the current number of elements present in the map.
 *  - `isEmpty()` - Checks whether the collection is empty.
 *  - `get({ key })` - Get the data stored at the provided key.
 *  - `set({ key, value })` - Store a new value at the provided key.
 *  - `remove_key({ key })` - Removes and retrieves the element with the provided key.
 *  - `clear()` - Remove all of the elements stored within the collection.
 *  - `toArray()` - Return a JavaScript array of the data stored within the collection.
 *  - `extend({ kvs })` - Extends the current collection with the passed in array of key-value pairs.
 *  - `add_house()` - Store a new `House` object in the `unorderedMap` instance.
 *  - `get_house()` - Retrieves the current `House` object from the `unorderedMap` and returns a string `house.describe() + room.describe()`
 *  - `keys({ start, limit })` - Converts the deserialized data from storage to a JavaScript instance of the collection.
 * @param unorderedMap - Simple `UnorderedMap` used for testing.
 */
@NearBindgen({})
export class UnorderedMapTestContract {
  constructor() {
    this.unorderedMap = new UnorderedMap("a");
  }

  @view({})
  len() {
    return this.unorderedMap.length;
  }

  @view({})
  isEmpty() {
    return this.unorderedMap.isEmpty();
  }

  @view({})
  get({ key }) {
    return this.unorderedMap.get(key);
  }

  @call({})
  set({ key, value }) {
    this.unorderedMap.set(key, value);
  }

  @call({})
  remove_key({ key }) {
    this.unorderedMap.remove(key);
  }

  @call({})
  clear() {
    this.unorderedMap.clear();
  }

  @view({})
  toArray() {
    return this.unorderedMap.toArray();
  }

  @call({})
  extend({ kvs }) {
    this.unorderedMap.extend(kvs);
  }

  @call({})
  add_house() {
    this.unorderedMap.set(
      "house1",
      new House("house1", [
        new Room("room1", "200sqft"),
        new Room("room2", "300sqft"),
      ])
    );
  }

  @view({})
  get_house() {
    const house = this.unorderedMap.get("house1", {
      reconstructor: (rawHouse) =>
        new House(
          rawHouse.name,
          rawHouse.rooms.map((rawRoom) => new Room(rawRoom.name, rawRoom.size))
        ),
    });
    const room = house.rooms[0];
    return house.describe() + room.describe();
  }

  @view({})
  keys({ start, limit }) {
    return this.unorderedMap.keys({ start, limit });
  }
}
