import { NearBindgen, call, view, near } from "near-sdk-js";

@NearBindgen({})
export class CleanState {
  @call({})
  clean({ keys }) {
    keys.forEach((key) => near.storageRemove(key));
  }

  @call({})
  put({ key, value }) {
    near.storageWrite(key, value);
  }

  @view({})
  get({ key }) {
    return near.storageRead(key);
  }
}
