import * as near from "./api";
export function initialize({}) {
    return function (target, key, descriptor) {
    };
}
export function call({ privateFunction = false, payableFunction = false }) {
    return function (target, key, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            if (privateFunction && near.predecessorAccountId() !== near.currentAccountId()) {
                throw Error("Function is private");
            }
            if (!payableFunction && near.attachedDeposit() > BigInt(0)) {
                throw Error("Function is not payable");
            }
            return originalMethod.apply(this, args);
        };
    };
}
export function view({}) {
    return function (target, key, descriptor) {
    };
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
            static _reconstruct(classObject, plainObject) {
                for (const item in classObject) {
                    if (classObject[item].constructor?.reconstruct !== undefined) {
                        classObject[item] = classObject[item].constructor.reconstruct(plainObject[item]);
                    }
                    else {
                        classObject[item] = plainObject[item];
                    }
                }
                return classObject;
            }
            static _requireInit() {
                return requireInit;
            }
        };
    };
}
