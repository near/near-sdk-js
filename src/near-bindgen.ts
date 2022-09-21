import * as near from "./api";
import { deserialize, serialize } from "./utils";

type EmptyParameterObject = Record<never, never>;
type AnyObject = Record<string, unknown>;
type AnyFunction = (...args: unknown[]) => unknown;
// type DecoratorFunction = (
//   target: AnyObject,
//   key: string | symbol,
//   descriptor: TypedPropertyDescriptor<Function>
// ) => void;

export function initialize(_empty: EmptyParameterObject) {
  /* eslint-disable @typescript-eslint/no-empty-function */
  return function (
    _target: unknown,
    _key: string | symbol,
    _descriptor: TypedPropertyDescriptor<AnyFunction>
  ): void {};
  /* eslint-enable @typescript-eslint/no-empty-function */
}

export function call({
  privateFunction = false,
  payableFunction = false,
}: {
  privateFunction?: boolean;
  payableFunction?: boolean;
}) {
  return function (
    _target: unknown,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<AnyFunction>
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
  /* eslint-disable @typescript-eslint/no-empty-function */
  return function (
    _target: unknown,
    _key: string | symbol,
    _descriptor: TypedPropertyDescriptor<AnyFunction>
  ): void {};
  /* eslint-enable @typescript-eslint/no-empty-function */
}

export function NearBindgen({
  requireInit = false,
  serializer = serialize,
  deserializer = deserialize,
}: {
  requireInit?: boolean;
  serializer?(value: unknown): string;
  deserializer?(value: string): unknown;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <T extends { new (...args: any[]): any }>(target: T) => {
    return class extends target {
      static _create() {
        return new target();
      }

      static _getState(): unknown | null {
        const rawState = near.storageRead("STATE");
        return rawState ? this._deserialize(rawState) : null;
      }

      static _saveToStorage(objectToSave: unknown): void {
        near.storageWrite("STATE", this._serialize(objectToSave));
      }

      static _getArgs(): unknown {
        return JSON.parse(near.input() || "{}");
      }

      static _serialize(value: unknown, forReturn = false): string {
        if (forReturn) {
          return JSON.stringify(value, (_, value) =>
            typeof value === "bigint" ? `${value}` : value
          );
        }

        return serializer(value);
      }

      static _deserialize(value: string): unknown {
        return deserializer(value);
      }

      static _reconstruct(classObject: object, plainObject: AnyObject): object {
        for (const item in classObject) {
          const reconstructor = classObject[item].constructor?.reconstruct;

          classObject[item] = reconstructor
            ? reconstructor(plainObject[item])
            : plainObject[item];
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
