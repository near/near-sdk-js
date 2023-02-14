import { NearBindgen, call, UnorderedMap } from "near-sdk-js";

@NearBindgen({})
export class HighlevelCollection {
  constructor() {
    this.unorderedMap = new UnorderedMap("a");
  }

  @call({})
  set({ key, value }) {
    this.unorderedMap.set(key, value);
  }
}
