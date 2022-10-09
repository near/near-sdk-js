import { NearBindgen, call, view, UnorderedMap } from "near-sdk-js";
import { House, Room } from "./model.js";

class Test {
    constructor(){}
}

@NearBindgen({})
<<<<<<< HEAD
class UnorderedMapTestContract {


    constructor() {
       this.unorderedMap = new UnorderedMap('a');
    }
=======
export class UnorderedMapTestContract {
  constructor() {
    this.unorderedMap = new UnorderedMap("a");
  }
>>>>>>> 71f8b4fc2c0a3a5095611b71a67eb1b29584d495

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
}
