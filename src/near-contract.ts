import * as near from "./api";

export abstract class NearContract {
  deserialize() {
    const rawState = near.storageRead("STATE");
    let c = this.default()
    if (rawState) {
      const state = JSON.parse(rawState)
      Object.assign(this, state);
      // reconstruction of the contract class object from plain object
      for (const item in c) {
        if (c[item].constructor?.deserialize !== undefined) {
          this[item] = c[item].constructor.deserialize(this[item])
        }
      }
    } else {
      Object.assign(this, c)
    }
  }

  serialize() {
    near.storageWrite("STATE", JSON.stringify(this));
  }

  static deserializeArgs(): any {
    let args = near.input();
    return JSON.parse(args || "{}");
  }

  static serializeReturn(ret: any) {
    return JSON.stringify(ret);
  }

  // needed for deserialization of the contract class object from plain object
  abstract default()

  init(): any {}
}
