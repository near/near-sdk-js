import { NearBindgen, near, call, view } from "near-sdk-js";
  
@NearBindgen({})
export class Contract {
  @view({})
  numeric({a} : {a: number}) {}

  @view({})
  schema_string({a}: {a: string}) {}
 
  @view({})
  schema_other_primitives({a, b}: {a: boolean, b: null}) {}

  @view({})
  schema_tuples({a, b, c}: {a: [boolean], b: [boolean, boolean], c: [boolean, boolean, boolean]}) {}

  @view({})
  schema_array({a}: {a: boolean[]}) {}

  @view({})
  schema_struct({a}: {a: {first: number, second: number}}) {}
}