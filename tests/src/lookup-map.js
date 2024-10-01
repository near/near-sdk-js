import { NearBindgen, call, view, LookupMap } from "near-sdk-js";
import { House, Room } from "./model.js";

/**
 * Simple contract used to test `lookupMap` functionality.
 * - Includes methods:
 *  - `get({ key })` - Get the data stored at the provided key.
 *  - `containsKey({ key })` - Checks whether the collection contains the value.
 *  - `set({ key, value })` - Store a new value at the provided key.
 *  - `remove_key({ key })` - Removes and retrieves the element with the provided key.
 *  - `extend({ kvs })` - Extends the current collection with the passed in array of key-value pairs.
 *  - `add_house()` - Adds a test `House` object in the `lookupMap`.
 *  - `get_house()` - Returns a `string` containing the `house.describe()` + `room.describe()` results.
 * @param lookupMap - Simple `LookupMap` used for testing.
 */
@NearBindgen({})
export class LookupMapTestContract {
  constructor() {
    this.lookupMap = new LookupMap("a");
  }

  @view({})
  get({ key }) {
    return this.lookupMap.get(key);
  }

  @view({})
  containsKey({ key }) {
    return this.lookupMap.containsKey(key);
  }

  @call({})
  set({ key, value }) {
    this.lookupMap.set(key, value);
  }

  @call({})
  remove_key({ key }) {
    this.lookupMap.remove(key);
  }

  @call({})
  extend({ kvs }) {
    this.lookupMap.extend(kvs);
  }

  @call({})
  add_house() {
    this.lookupMap.set(
      "house1",
      new House("house1", [
        new Room("room1", "200sqft"),
        new Room("room2", "300sqft"),
      ])
    );
  }

  @view({})
  get_house() {
    const houseObject = this.lookupMap.get("house1");
    // restore class object from serialized data
    const house = new House(houseObject.name, houseObject.rooms);
    const roomObject = house.rooms[0];
    const room = new Room(roomObject.name, roomObject.size);
    return house.describe() + room.describe();
  }
}
