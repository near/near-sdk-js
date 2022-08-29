import * as near from "./api";

export function initialize(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}

export function call(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}

export function view(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}


export function NearBindgen<T extends { new(...args: any[]): {} }>(target: T) {
    return class extends target {
        static _create() {
            return new target();
        }

        static _getState(): Object {
            const rawState = near.storageRead("STATE");
            return rawState ? this._deserialize(rawState) : null;
        }

        static _saveToStorage(): void {
            near.storageWrite("STATE", this._serialize(this));
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
    }
}

