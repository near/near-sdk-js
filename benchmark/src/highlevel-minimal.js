import { NearBindgen, call } from "near-sdk-js";

@NearBindgen({})
export class HighlevelMinimal {
  @call({})
  empty({}) {}
}
