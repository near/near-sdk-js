import { NearBindgen, near, call, view, initialize } from "near-sdk-js";

@NearBindgen({})
export class Contract {
  @view({})
  add({ a, b }: { a: number; b: number }): number {
    return a + b;
  }

  @call({})
  add2({ a, b }: { a: number; b: number }): number {
    return a + b;
  }

  @initialize({})
  add3({ a, b }: { a: number; b: number }): number {
    return a + b;
  }

  @call({ payableFunction: true })
  add4({ a, b }: { a: number; b: number }): number {
    return a + b;
  }

  @call({ privateFunction: true })
  add5({ a, b }: { a: number; b: number }): number {
    return a + b;
  }
}
