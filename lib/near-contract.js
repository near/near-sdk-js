import * as near from "./api";
var StateSource;
(function (StateSource) {
    StateSource[StateSource["CONTRACT"] = 0] = "CONTRACT";
    StateSource[StateSource["DEFAULT"] = 1] = "DEFAULT";
})(StateSource || (StateSource = {}));
export class NearContract {
    deserialize() {
        const rawState = near.storageRead("STATE");
        if (rawState) {
            const state = JSON.parse(rawState);
            // reconstruction of the contract class object from plain object
            // @ts-ignore
            let c = _get();
            Object.assign(this, state);
            for (const item in c) {
                if (c[item].constructor?.deserialize !== undefined) {
                    this[item] = c[item].constructor.deserialize(this[item]);
                }
            }
            return StateSource.CONTRACT;
        }
        else {
            // @ts-ignore
            const defaultState = _default();
            Object.assign(this, defaultState);
            return StateSource.DEFAULT;
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
