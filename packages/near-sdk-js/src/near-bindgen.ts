import * as near from "./api";
import { deserialize, serialize, bytes, encode } from "./utils";

type EmptyParameterObject = Record<never, never>;
type AnyObject = Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DecoratorFunction = <AnyFunction extends (...args: any) => any>(
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<AnyFunction>
) => void;

/**
 * Tells the SDK to use this function as the migration function of the contract.
 * The migration function will ignore te existing state.
 * @param _empty - An empty object.
 */
export function migrate(_empty: EmptyParameterObject): DecoratorFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <AnyFunction extends (...args: any) => any>(
    _target: object,
    _key: string | symbol,
    _descriptor: TypedPropertyDescriptor<AnyFunction>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): void {};
}

/**
 * Tells the SDK to use this function as the initialization function of the contract.
 *
 * @param _empty - An empty object.
 */
export function initialize(_empty: EmptyParameterObject): DecoratorFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <AnyFunction extends (...args: any) => any>(
    _target: object,
    _key: string | symbol,
    _descriptor: TypedPropertyDescriptor<AnyFunction>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): void {};
}

/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
export function view(_empty: EmptyParameterObject): DecoratorFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <AnyFunction extends (...args: any) => any>(
    _target: object,
    _key: string | symbol,
    _descriptor: TypedPropertyDescriptor<AnyFunction>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): void {};
}

/**
 * Tells the SDK to expose this function as a call function.
 * Adds the neccessary checks if the function is private or payable.
 *
 * @param options - Options to configure the function behaviour.
 * @param options.privateFunction - Whether the function can be called by other contracts.
 * @param options.payableFunction - Whether the function can accept an attached deposit.
 * @returns
 */
export function call(options: {
  privateFunction?: boolean;
  payableFunction?: boolean;
}): DecoratorFunction;
export function call({
  privateFunction = false,
  payableFunction = false,
}: {
  privateFunction?: boolean;
  payableFunction?: boolean;
}): DecoratorFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <AnyFunction extends (...args: any) => any>(
    _target: object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<AnyFunction>
  ): void {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    descriptor.value = function (
      ...args: Parameters<AnyFunction>
    ): ReturnType<AnyFunction> {
      if (
        privateFunction &&
        near.predecessorAccountId() !== near.currentAccountId()
      ) {
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
 * The interface that a middleware has to implement in order to be used as a middleware function/class.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Middleware<Arguments extends Array<any>> {
  /**
   * The method that gets called with the same arguments that are passed to the function it is wrapping.
   *
   * @param args - Arguments that will be passed to the function - immutable.
   */
  (...args: Arguments): void;
}

/**
 * Tells the SDK to apply an array of passed in middleware to the function execution.
 *
 * @param middlewares - The middlewares to be executed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function middleware<Arguments extends Array<any>>(
  ...middlewares: Middleware<Arguments>[]
): DecoratorFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <AnyFunction extends (...args: Arguments) => any>(
    _target: object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<AnyFunction>
  ): void {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    descriptor.value = function (...args: Arguments): ReturnType<AnyFunction> {
      try {
        middlewares.forEach((middleware) => middleware(...args));
      } catch (error) {
        throw new Error(error);
      }

      return originalMethod.apply(this, args);
    };
  };
}

/**
 * Extends this class with the methods needed to make the contract storable/serializable and readable/deserializable to and from the blockchain.
 * Also tells the SDK to capture and expose all view, call and initialize functions.
 * Tells the SDK whether the contract requires initialization and whether to use a custom serialization/deserialization function when storing/reading the state.
 *
 * @param options - Options to configure the contract behaviour.
 * @param options.requireInit - Whether the contract requires initialization.
 * @param options.serializer - Custom serializer function to use for storing the contract state.
 * @param options.deserializer - Custom deserializer function to use for reading the contract state.
 */
export function NearBindgen(options: {
  requireInit?: boolean;
  serializer?(value: unknown): Uint8Array;
  deserializer?(value: Uint8Array): unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any;
export function NearBindgen({
  requireInit = false,
  serializer = serialize,
  deserializer = deserialize,
}: {
  requireInit?: boolean;
  serializer?(value: unknown): Uint8Array;
  deserializer?(value: Uint8Array): unknown;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <T extends { new (...args: any[]): any }>(target: T) => {
    return class extends target {
      static _create() {
        return new target();
      }

      /// 如何return Class而不是json
      static _getState(): unknown | null {
        const rawState = near.storageReadRaw(bytes("STATE"));
        return rawState ? this._deserialize(rawState) : null;
      }

      static _saveToStorage(objectToSave: unknown): void {
        near.storageWriteRaw(bytes("STATE"), this._serialize(objectToSave));
      }

      static _getArgs(): unknown {
        return JSON.parse(near.input() || "{}");
      }

      static _serialize(value: unknown, forReturn = false): Uint8Array {
        if (forReturn) {
          return encode(
            JSON.stringify(value, (_, value) =>
              typeof value === "bigint" ? `${value}` : value
            )
          );
        }

        return serializer(value);
      }

      static _deserialize(value: Uint8Array): unknown {
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
  /**
   * A macro that reads the WASM code from the specified path at compile time.
   *
   * @param pathToWasm - The path to the WASM file to read code from.
   */
  export function includeBytes(pathToWasm: string): Uint8Array;
}
