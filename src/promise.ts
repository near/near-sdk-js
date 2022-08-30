import { Bytes } from "..";
import { Balance, PublicKey } from "./types";

export class CreateAccount {}
export class DeployContract {
    constructor(public code: Bytes) {}
}
export class FunctionCall {
    constructor(public function_name: string, public args: Bytes, public amount: Balance) {}
}
// TODO add FunctionCallWeight after add that in api.ts
export class Transfer {
    constructor(public amount: Balance) {}
}
export class Stake {
    constructor(public amount: Balance, public public_key: PublicKey) {}
}

export type PromiseAction = [string]
export type A = [string]
let a: A = ["a"]
let b: PromiseAction = ["a"]
