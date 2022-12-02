import * as near from "./api";
import { deserialize, serialize, bytes, str } from "./utils";
/**
 * Tells the SDK to use this function as the initialization function of the contract.
 *
 * @param _empty - An empty object.
 */
export function initialize(_empty) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (_target, _key, _descriptor
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) { };
}
/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
export function view(_empty) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (_target, _key, _descriptor
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) { };
}
export function call({ privateFunction = false, payableFunction = false, }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (_target, _key, descriptor) {
        const originalMethod = descriptor.value;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
/**
 * Tells the SDK to apply an array of passed in middleware to the function execution.
 *
 * @param middlewares - The middlewares to be executed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function middleware(...middlewares) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (_target, _key, descriptor) {
        const originalMethod = descriptor.value;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        descriptor.value = function (...args) {
            try {
                middlewares.forEach((middleware) => middleware(...args));
            }
            catch (error) {
                throw new Error(error);
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
                const rawState = near.storageRead(bytes("STATE"));
                return rawState ? this._deserialize(rawState) : null;
            }
            static _saveToStorage(objectToSave) {
                near.storageWrite(bytes("STATE"), this._serialize(objectToSave));
            }
            static _getArgs() {
                return JSON.parse(str(near.input()) || "{}");
            }
            static _serialize(value, forReturn = false) {
                if (forReturn) {
                    return bytes(JSON.stringify(value, (_, value) => typeof value === "bigint" ? `${value}` : value));
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
