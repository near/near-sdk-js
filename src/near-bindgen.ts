import * as near from "./api";

export function initialize(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}

export function call(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}

export function view(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}

export function NearBindgen({ requireInit = false }: { requireInit: boolean }) {
    return <T extends { new(...args: any[]): {} }>(target: T) => {
        return class extends target {
            static _create() {
                return new target();
            }

            static _getState(): Object {
                const rawState = near.storageRead("STATE");
                return rawState ? this._deserialize(rawState) : null;
            }

            static _saveToStorage(obj: Object): void {
                near.storageWrite("STATE", this._serialize(obj));
            }

            static _getArgs(): JSON {
                return JSON.parse(near.input() || "{}");
            }

            static _serialize(value: Object): string {
                return JSON.stringify(value);
            }

            static _deserialize(value: string): Object {
                return JSON.parse(value);
            }

            static _reconstruct(classObject: any, plainObject: JSON) {
                for (const item in classObject) {
                    if (classObject[item].constructor?.deserialize !== undefined) {
                        classObject[item] = classObject[item].constructor.deserialize(plainObject[item])
                    } else {
                        classObject[item] = plainObject[item]
                    }
                }
                return classObject
            }

            static _requireInit(): boolean {
                return requireInit;
            }
        }
    }
}