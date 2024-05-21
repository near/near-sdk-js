import { NearBindgen, near, call, view } from "near-sdk-js";

@NearBindgen({})
export class Contract {
  @view({})
  foo() {}

  @view({})
  bar(): number {
    return 0;
  }
}
