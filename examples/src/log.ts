import { near } from 'near-sdk-js'

export function log(msg: unknown) {
  near.log(msg);
}
