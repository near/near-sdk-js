import { near } from "near-sdk-js";

export function log(msg: any) {
  near.log(msg);
}
