import * as near from "./api";

type EmptyParameterObject = Record<never, never>;
// type AnyObject = Record<string, unknown>;
// type DecoratorFunction = (
//   target: AnyObject,
//   key: string | symbol,
//   descriptor: TypedPropertyDescriptor<Function>
// ) => void;

export function initialize(_empty: EmptyParameterObject) {
  return function (
    _target: any,
    _key: string | symbol,
    _descriptor: TypedPropertyDescriptor<Function>
  ): void {};
}

export function call({
  privateFunction = false,
  payableFunction = false,
}: {
  privateFunction?: boolean;
  payableFunction?: boolean;
}) {
  return function (
    _target: any,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<Function>
  ): void {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      if (
        privateFunction &&
        near.predecessorAccountId() !== near.currentAccountId()
      ) {
        throw Error("Function is private");
      }
      if (!payableFunction && near.attachedDeposit() > BigInt(0)) {
        throw Error("Function is not payable");
      }
      return originalMethod.apply(this, args);
    };
  };
}

export function view(_empty: EmptyParameterObject) {
  return function (
    _target: any,
    _key: string | symbol,
    _descriptor: TypedPropertyDescriptor<Function>
  ): void {};
}

export function NearBindgen({
  requireInit = false,
}: {
  requireInit?: boolean;
}) {
  return <T extends { new (...args: any[]): any }>(target: T) => {
    return class extends target {
      static _create() {
        return new target();
      }

      static _getState(): any {
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
          if (classObject[item].constructor?.reconstruct !== undefined) {
            classObject[item] = classObject[item].constructor.reconstruct(
              plainObject[item]
            );
          } else {
            classObject[item] = plainObject[item];
          }
        }
        return classObject;
      }

      static _requireInit(): boolean {
        return requireInit;
      }
    };
  };
}

declare module "./" {
  export function includeBytes(pathToWasm: string): string;
}
