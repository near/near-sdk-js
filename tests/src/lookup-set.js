import { NearBindgen, call, view, LookupSet } from "near-sdk-js";
import { House, Room } from "./model.js";

/**
 * Simple contract used to test `lookupSet` functionality.
 * - Includes methods:
 *  - `contains({ key })` - Checks whether the value is present in the set.
 *  - `set({ key })` - f the set did not have this value present, `true` is returned. If the set did have this value present, `false` is returned.
 *  - `remove_key({ key })` - Removes and retrieves the element with the provided key.
 *  - `extend({ keys })` - Extends the current collection with the passed array of elements.
 *  - `add_house({ name, rooms })` - Adds a test `House` object in the `lookupSet`.
 *  - `house_exist({ name, rooms })` - Checks whether the value is present in the set, `true` if present, `false` if not.
 * @param lookupSet - Simple `LookupSet` used for testing.
 */
@NearBindgen({})
export class LookupSetTestContract {
  constructor() {
    this.lookupSet = new LookupSet("a");
  }

  @view({})
  contains({ key }) {
    return this.lookupSet.contains(key);
  }

  @call({})
  set({ key }) {
    this.lookupSet.set(key);
  }

  @call({})
  remove_key({ key }) {
    this.lookupSet.remove(key);
  }

  @call({})
  extend({ keys }) {
    this.lookupSet.extend(keys);
  }

  @call({})
  add_house({ name, rooms }) {
    let house = new House(name, []);
    for (let r of rooms) {
      house.rooms.push(new Room(r.name, r.size));
    }
    this.lookupSet.set(house);
  }

  @view({})
  house_exist({ name, rooms }) {
    let house = new House(name, []);
    for (let r of rooms) {
      house.rooms.push(new Room(r.name, r.size));
    }
    return this.lookupSet.contains(house);
  }
}
