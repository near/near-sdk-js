import { GetOptions } from "./types/collections";

export type Bytes = string;
export type PromiseIndex = number | bigint;
export type NearAmount = number | bigint;
export type Register = number | bigint;

const BIGINT_KEY = "bigint";
const BIGINT_BRAND = "tnigib";

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

export function assert(expression: boolean, message: string): void {
  if (!expression) {
    throw Error("assertion failed: " + message);
  }
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export function getValueWithOptions<DataType>(
  value: unknown,
  options?: GetOptions<DataType>
): DataType | null {
  if (value === undefined || value === null) {
    return options?.defaultValue ?? null;
  }

  if (options?.reconstructor) {
    return options.reconstructor(value);
  }

  return value as DataType;
}

export function serialize(valueToSerialize: unknown): string {
  return JSON.stringify(valueToSerialize, (_, value) => {
    if (typeof value === "bigint") {
      return {
        value: value.toString(),
        [BIGINT_KEY]: BIGINT_BRAND,
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
      Object.keys(value).every((key) => ["value", BIGINT_KEY].includes(key)) &&
      value[BIGINT_KEY] === BIGINT_BRAND
    ) {
      return BigInt(value["value"]);
    }

    return value;
  });
}
