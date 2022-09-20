import { NearBindgen, call, view, Vector } from "near-sdk-js";
import { House, Room } from "./model.js";

@NearBindgen({})
class VectorTestContract {
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
