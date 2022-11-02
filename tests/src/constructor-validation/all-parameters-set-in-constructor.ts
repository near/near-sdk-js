import { NearBindgen, LookupMap, call } from "near-sdk-js";

@NearBindgen({})
export class ConstructorValidation {
  map: LookupMap<string>;
  name: string;
  constructor() {
    this.map = new LookupMap<string>("a");
    this.name = "";
  }

  @call({})
  get() {
    return { status: "ok" };
  }
}
