import { NearBindgen, call } from "near-sdk-js";

/**
 * More information for that can be found in the README.md
 * - A highlevel minimal contract (using nearbindgen)
 */
@NearBindgen({})
export class HighlevelMinimal {
  @call({})
  empty({}) {}
}
