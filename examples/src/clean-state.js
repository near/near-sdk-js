import { NearBindgen, call, view, near, encode, decode } from "near-sdk-js";

@NearBindgen({})
export class CleanState {
  @call({})
  clean({ keys }) {
    keys.forEach((key) => near.storageRemove(encode(key)));
  }

  @call({})
  put({ key, value }) {
    near.storageWrite(encode(key), encode(value));
  }

  @view({})
  get({ key }) {
    let raw = near.storageRead(encode(key));
    if (raw !== null) {
      return decode(raw)
    }
    return null
  }
}
