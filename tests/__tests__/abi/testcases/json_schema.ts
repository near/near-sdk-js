import { NearBindgen, near, call, view } from "near-sdk-js";

type Pair = [number, number];

interface PairNamed {
    first: number;
    second: number;
};

enum IpAddrKind {
    V4,
    V6
};

interface IpV4 {
    kind: IpAddrKind.V4;
    octets: [number, number, number, number];
}

interface IpV6 {
    kind: IpAddrKind.V6;
    address: string;
}

type IpAddr = IpV4 | IpV6;

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
  schema_struct({a, b}: {a: Pair, b: PairNamed}) {}

  @view({})
  schema_enum({simple, complex}: {simple: IpAddrKind, complex: IpAddr}) {}
}