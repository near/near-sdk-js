import * as near from "./api";
import { deserialize, serialize } from "./utils";
export function initialize(_empty) {
    return function (_target, _key, _descriptor
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) { };
}
export function view(_empty) {
    return function (_target, _key, _descriptor
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) { };
}
export function call({ privateFunction = false, payableFunction = false, }) {
    return function (_target, _key, descriptor) {
        const originalMethod = descriptor.value;
        // @ts-ignore
        descriptor.value = function (...args) {
            if (privateFunction &&
                near.predecessorAccountId() !== near.currentAccountId()) {
                throw new Error("Function is private");
            }
            if (!payableFunction && near.attachedDeposit() > 0n) {
                throw new Error("Function is not payable");
            }
            return originalMethod.apply(this, args);
        };
    };
}
export function NearBindgen({ requireInit = false, serializer = serialize, deserializer = deserialize, }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target) => {
        return class extends target {
            static _create() {
                return new target();
            }
            static _getState() {
                const rawState = near.storageRead("STATE");
                return rawState ? this._deserialize(rawState) : null;
            }
            static _saveToStorage(objectToSave) {
                near.storageWrite("STATE", this._serialize(objectToSave));
            }
            static _getArgs() {
                return JSON.parse(near.input() || "{}");
            }
            static _serialize(value, forReturn = false) {
                if (forReturn) {
                    return JSON.stringify(value, (_, value) => typeof value === "bigint" ? `${value}` : value);
                }
                return serializer(value);
            }
            static _deserialize(value) {
                return deserializer(value);
            }
            static _reconstruct(classObject, plainObject) {
                for (const item in classObject) {
                    const reconstructor = classObject[item].constructor?.reconstruct;
                    classObject[item] = reconstructor
                        ? reconstructor(plainObject[item])
                        : plainObject[item];
                }
                return classObject;
            }
            static _requireInit() {
                return requireInit;
            }
        };
    };
}
