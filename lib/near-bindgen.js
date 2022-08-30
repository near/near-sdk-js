import * as near from "./api";
export function initialize(target, key, descriptor) {
}
export function call(target, key, descriptor) {
}
export function view(target, key, descriptor) {
}
export function NearBindgen({ requireInit = false }) {
    return (target) => {
        return class extends target {
            static _create() {
                return new target();
            }
            static _getState() {
                const rawState = near.storageRead("STATE");
                return rawState ? this._deserialize(rawState) : null;
            }
            static _saveToStorage(obj) {
                near.storageWrite("STATE", this._serialize(obj));
            }
            static _getArgs() {
                return JSON.parse(near.input() || "{}");
            }
            static _serialize(value) {
                return JSON.stringify(value);
            }
            static _deserialize(value) {
                return JSON.parse(value);
            }
            static _requireInit() {
                return requireInit;
            }
        };
    };
}
