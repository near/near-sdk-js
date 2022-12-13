// This contract implements exact same functionality as counter.js, but only use low level APIs
import { near } from "near-sdk-js";

export function init() {
  let argsRaw = near.input();
  let args = JSON.parse(argsRaw || "{}");
  let initial = args.initial || 0;
  let count = initial;
  let state = JSON.stringify({ count });
  near.storageWrite("STATE", state);
}

function deserialize() {
  let state = near.storageRead("STATE");
  if (state) {
    return JSON.parse(state);
  } else {
    return { count: 0 };
  }
}

export function getCount() {
  let state = deserialize();
  let count = state.count;
  near.valueReturn(JSON.stringify(count));
}

export function increase() {
  let argsRaw = near.input();
  let args = JSON.parse(argsRaw || "{}");
  let n = args.n || 1;
  let state = deserialize();
  state.count += n;
  near.log(`Counter increased to ${state.count}`);
  near.storageWrite("STATE", JSON.stringify(state));
}

export function decrease() {
  let argsRaw = near.input();
  let args = JSON.parse(argsRaw || "{}");
  let n = args.n || 1;
  let state = deserialize();
  state.count -= n;
  near.log(`Counter decreased to ${state.count}`);
  near.storageWrite("STATE", JSON.stringify(state));
}
