import * as near from "./api";

enum StateSource {
  CONTRACT,
  DEFAULT
}
export abstract class NearContract {
  deserialize(): StateSource {
    const rawState = near.storageRead("STATE");
    if (rawState) {
      const state = JSON.parse(rawState)
      // reconstruction of the contract class object from plain object
      // @ts-ignore
      let c = _get()
      Object.assign(this, state);
      for (const item in c) {
        if (c[item].constructor?.deserialize !== undefined) {
          this[item] = c[item].constructor.deserialize(this[item])
        }
      }
      return StateSource.CONTRACT
    } else {
      // @ts-ignore
      const defaultState = _get()
      Object.assign(this, defaultState)
      return StateSource.DEFAULT
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
}
