import * as near from "./api";

export class NearContract {
  deserialize() {
    let state = near.jsvmStorageRead("STATE");
    if (state) {
      Object.assign(this, JSON.parse(state));
    } else {
      throw new Error("Contract state is empty");
    }
  }

  serialize() {
    near.jsvmStorageWrite("STATE", JSON.stringify(this));
  }

  static deserializeArgs(): any {
    let args = near.jsvmArgs();
    return JSON.parse(args || "{}");
  }

  static serializeReturn(ret: any) {
    return JSON.stringify(ret);
  }
}