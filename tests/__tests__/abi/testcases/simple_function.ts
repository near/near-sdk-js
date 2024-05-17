import { NearBindgen, near, call, view } from "near-sdk-js";
  
@NearBindgen({})
export class Contract {
  @view({})
  add({a, b} : {a: number, b: number}): number {
    return a+b;
  }
}