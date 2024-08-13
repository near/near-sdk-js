import { NearBindgen, call, UnorderedMap } from "near-sdk-js";

/**
 * More information for that can be found in the README.md
 * - Highlevel collection
 */
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
