import * as near from "./api";
// type AnyObject = Record<string, unknown>;
// type DecoratorFunction = (
//   target: AnyObject,
//   key: string | symbol,
//   descriptor: TypedPropertyDescriptor<Function>
// ) => void;
export function initialize(_empty) {
    /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/ban-types */
    return function (_target, _key, _descriptor) { };
    /* eslint-enable @typescript-eslint/no-empty-function, @typescript-eslint/ban-types */
}
export function call({ privateFunction = false, payableFunction = false, }) {
    /* eslint-disable @typescript-eslint/ban-types */
    return function (_target, _key, descriptor) {
        /* eslint-enable @typescript-eslint/ban-types */
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            if (privateFunction &&
                near.predecessorAccountId() !== near.currentAccountId()) {
                throw Error("Function is private");
            }
            if (!payableFunction && near.attachedDeposit() > BigInt(0)) {
                throw Error("Function is not payable");
            }
            return originalMethod.apply(this, args);
        };
    };
}
export function view(_empty) {
    /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/ban-types */
    return function (_target, _key, _descriptor) { };
    /* eslint-enable @typescript-eslint/no-empty-function, @typescript-eslint/ban-types */
}
export function NearBindgen({ requireInit = false, }) {
    return (target) => {
        return class extends target {
            static _create() {
                return new target();
            }
            static _getState() {
                const rawState = near.storageRead("STATE");
                return rawState ? this._deserialize(rawState) : null;
            }
            /* eslint-disable-next-line @typescript-eslint/ban-types */
            static _saveToStorage(obj) {
                near.storageWrite("STATE", this._serialize(obj));
            }
            static _getArgs() {
                return JSON.parse(near.input() || "{}");
            }
            /* eslint-disable-next-line @typescript-eslint/ban-types */
            static _serialize(value) {
                return JSON.stringify(value);
            }
            /* eslint-disable-next-line @typescript-eslint/ban-types */
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
