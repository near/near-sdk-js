import * as near from "./api";
export class NearContract {
    deserialize() {
        const rawState = near.storageRead("STATE");
        if (rawState) {
            const state = JSON.parse(rawState);
            // reconstruction of the contract class object from plain object
            let c = this.default();
            Object.assign(this, state);
            for (const item in c) {
                if (c[item].constructor?.deserialize !== undefined) {
                    this[item] = c[item].constructor.deserialize(this[item]);
                }
            }
        }
        else {
            throw new Error("Contract state is empty");
        }
    }
    serialize() {
        near.storageWrite("STATE", JSON.stringify(this));
    }
    static deserializeArgs() {
        let args = near.input();
        return JSON.parse(args || "{}");
    }
    static serializeReturn(ret) {
        return JSON.stringify(ret);
    }
}
