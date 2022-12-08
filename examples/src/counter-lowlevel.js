// This contract implements exact same functionality as counter.js, but only use low level APIs
import { near, bytes, str } from "near-sdk-js";

export function init() {
  let argsRaw = near.input();
  let args = JSON.parse(str(argsRaw) || "{}");
  let initial = args.initial || 0;
  let count = initial;
  let state = JSON.stringify({ count });
  near.storageWrite(bytes("STATE"), bytes(state));
}

function deserialize() {
  let state = near.storageRead(bytes("STATE"));
  if (state) {
    return JSON.parse(str(state));
  } else {
    return { count: 0 };
  }
}

export function getCount() {
  let state = deserialize();
  let count = state.count;
  near.valueReturn(bytes(JSON.stringify(count)));
}

export function increase() {
  let argsRaw = near.input();
  let args = JSON.parse(str(argsRaw) || "{}");
  let n = args.n || 1;
  let state = deserialize();
  state.count += n;
  near.log(`Counter increased to ${state.count}`);
  near.storageWrite(bytes("STATE"), bytes(JSON.stringify(state)));
}

export function decrease() {
  let argsRaw = near.input();
  let args = JSON.parse(str(argsRaw) || "{}");
  let n = args.n || 1;
  let state = deserialize();
  state.count -= n;
  near.log(`Counter decreased to ${state.count}`);
  near.storageWrite(bytes("STATE"), bytes(JSON.stringify(state)));
}
