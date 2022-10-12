import { GetOptions } from "./types/collections";

/**
 * A string containing byte characters. Can be safely used in NEAR calls.
 */
export type Bytes = string;

// make PromiseIndex a nominal typing
enum PromiseIndexBrand {
  _ = -1,
}
/**
 * A PromiseIndex which represents the ID of a NEAR Promise.
 */
export type PromiseIndex = (number | bigint) & PromiseIndexBrand;
/**
 * A number that specifies the amount of NEAR in yoctoNEAR.
 */
export type NearAmount = number | bigint;
/**
 * A number that specifies the ID of a register in the NEAR WASM virtual machine.
 */
export type Register = number | bigint;

const TYPE_KEY = "typeInfo";
enum TypeBrand {
  BIGINT = "bigint",
  DATE = "date",
}

export const ERR_INCONSISTENT_STATE =
  "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
export const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";

const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

export function u8ArrayToBytes(array: Uint8Array): Bytes {
  return array.reduce(
    (result, value) => `${result}${String.fromCharCode(value)}`,
    ""
  );
}

// TODO this function is a bit broken and the type can't be string
// TODO for more info: https://github.com/near/near-sdk-js/issues/78
export function bytesToU8Array(bytes: Bytes): Uint8Array {
  return Uint8Array.from([...bytes].map((byte) => byte.charCodeAt(0)));
}

/**
 * Accepts a string or Uint8Array and either checks for the validity of the string or converts the Uint8Array to Bytes.
 *
 * @param stringOrU8Array - The string or Uint8Array to be checked/transformed
 * @returns Safe Bytes to be used in NEAR calls.
 */
export function bytes(stringOrU8Array: string | Uint8Array): Bytes {
  if (typeof stringOrU8Array === "string") {
    return checkStringIsBytes(stringOrU8Array);
  }

  if (stringOrU8Array instanceof Uint8Array) {
    return u8ArrayToBytes(stringOrU8Array);
  }

  throw new Error("bytes: expected string or Uint8Array");
}

function checkStringIsBytes(value: string): string {
  [...value].forEach((character, index) => {
    assert(
      character.charCodeAt(0) <= 255,
      `string ${value} at index ${index}: ${character} is not a valid byte`
    );
  });

  return value;
}

/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
export function assert(
  expression: unknown,
  message: string
): asserts expression {
  if (!expression) {
    throw new Error("assertion failed: " + message);
  }
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export function getValueWithOptions<DataType>(
  value: string,
  options: Omit<GetOptions<DataType>, "serializer"> = {
    deserializer: deserialize,
  }
): DataType | null {
  const deserialized = deserialize(value);

  if (deserialized === undefined || deserialized === null) {
    return options?.defaultValue ?? null;
  }

  if (options?.reconstructor) {
    return options.reconstructor(deserialized);
  }

  return deserialized as DataType;
}

export function serializeValueWithOptions<DataType>(
  value: DataType,
  { serializer }: Pick<GetOptions<DataType>, "serializer"> = {
    serializer: serialize,
  }
): string {
  return serializer(value);
}

export function serialize(valueToSerialize: unknown): string {
  return JSON.stringify(valueToSerialize, function (key, value) {
    if (typeof value === "bigint") {
      return {
        value: value.toString(),
        [TYPE_KEY]: TypeBrand.BIGINT,
      };
    }

    if (
      typeof this[key] === "object" &&
      this[key] !== null &&
      this[key] instanceof Date
    ) {
      return {
        value: this[key].toISOString(),
        [TYPE_KEY]: TypeBrand.DATE,
      };
    }

    return value;
  });
}

export function deserialize(valueToDeserialize: string): unknown {
  return JSON.parse(valueToDeserialize, (_, value) => {
    if (
      value !== null &&
      typeof value === "object" &&
      Object.keys(value).length === 2 &&
      Object.keys(value).every((key) => ["value", TYPE_KEY].includes(key))
    ) {
      switch (value[TYPE_KEY]) {
        case TypeBrand.BIGINT:
          return BigInt(value["value"]);
        case TypeBrand.DATE:
          return new Date(value["value"]);
      }
    }

    return value;
  });
}

/**
 * Validates the Account ID according to the NEAR protocol
 * [Account ID rules](https://nomicon.io/DataStructures/Account#account-id-rules).
 *
 * @param accountId - The Account ID string you want to validate.
 */
export function validateAccountId(accountId: string): boolean {
  return (
    accountId.length >= 2 &&
    accountId.length <= 64 &&
    ACCOUNT_ID_REGEX.test(accountId)
  );
}
