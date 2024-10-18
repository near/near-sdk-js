import { GetOptions } from "./types/collections";

export interface Env {
  uint8array_to_latin1_string(a: Uint8Array): string;
  uint8array_to_utf8_string(a: Uint8Array): string;
  latin1_string_to_uint8array(s: string): Uint8Array;
  utf8_string_to_uint8array(s: string): Uint8Array;
}

declare const env: Env;

/**
 * A PromiseIndex which represents the ID of a NEAR Promise.
 */
export type PromiseIndex = number | bigint;
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

/**
 * Concat two Uint8Array
 * @param array1
 * @param array2
 * @returns the concatenation of two array
 */
export function concat(array1: Uint8Array, array2: Uint8Array): Uint8Array {
  const mergedArray = new Uint8Array(array1.length + array2.length);
  mergedArray.set(array1);
  mergedArray.set(array2, array1.length);
  return mergedArray;
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
  subDatatype: unknown,
  value: Uint8Array | null,
  options: Omit<GetOptions<DataType>, "serializer"> = {}
): DataType | null {
  if (value === null) {
    return options?.defaultValue ?? null;
  }

  const deserializer = options.deserializer || deserialize;

  // here is an obj
  let deserialized = deserializer(value);

  if (deserialized === undefined || deserialized === null) {
    return options?.defaultValue ?? null;
  }

  if (options?.reconstructor) {
    // example: // { collection: {reconstructor: LookupMap.reconstruct, value: 'string'}}
    const collection = options.reconstructor(deserialized);
    if (
      subDatatype !== undefined &&
      // eslint-disable-next-line no-prototype-builtins
      subDatatype.hasOwnProperty("class") &&
      // eslint-disable-next-line no-prototype-builtins
      subDatatype["class"].hasOwnProperty("value")
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      collection.subtype = function () {
        // example: {class: UnorderedMap, value: UnorderedMap}
        return subDatatype["class"]["value"];
      };
    }
    return collection;
  }

  // example: { collection: {reconstructor: LookupMap.reconstruct, value: 'string'}}
  if (subDatatype !== undefined) {
    // subtype info is a class constructor, Such as Car
    if (typeof subDatatype === "function") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deserialized = decodeObj2class(new subDatatype(), deserialized);
    } else if (typeof subDatatype === "object") {
      // normal collections of array, map; subtype will be:
      //  {map: { key: 'string', value: 'string' }} or {array: {value: 'string'}} ..
      // eslint-disable-next-line no-prototype-builtins
      if (subDatatype.hasOwnProperty("map")) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const mkey in deserialized) {
          if (subDatatype["map"]["value"] !== "string") {
            deserialized[mkey] = decodeObj2class(
              new subDatatype["map"]["value"](),
              value[mkey]
            );
          }
        }
        // eslint-disable-next-line no-prototype-builtins
      } else if (subDatatype.hasOwnProperty("array")) {
        const new_vec = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const k in deserialized) {
          if (subDatatype["array"]["value"] !== "string") {
            new_vec.push(
              decodeObj2class(new subDatatype["array"]["value"](), value[k])
            );
          }
        }
        deserialized = new_vec;
        // eslint-disable-next-line no-prototype-builtins
      }
    }
  }

  return deserialized as DataType;
}

export function serializeValueWithOptions<DataType>(
  value: DataType,
  { serializer }: Pick<GetOptions<DataType>, "serializer"> = {
    serializer: serialize,
  }
): Uint8Array {
  return serializer(value);
}

export function serialize(valueToSerialize: unknown): Uint8Array {
  return encode(
    JSON.stringify(valueToSerialize, function (key, value) {
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
    })
  );
}

export function deserialize(valueToDeserialize: Uint8Array): unknown {
  return JSON.parse(decode(valueToDeserialize), (_, value) => {
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

export function decodeObj2class(class_instance, obj) {
  if (
    typeof obj != "object" ||
    typeof obj === "bigint" ||
    obj instanceof Date ||
    class_instance.constructor.schema === undefined
  ) {
    return obj;
  }
  let key;
  for (key in obj) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const value = obj[key];
    if (typeof value == "object") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const ty = class_instance.constructor.schema[key];
      // eslint-disable-next-line no-prototype-builtins
      if (ty !== undefined && ty.hasOwnProperty("map")) {
        for (const mkey in value) {
          if (ty["map"]["value"] === "string") {
            class_instance[key][mkey] = value[mkey];
          } else {
            class_instance[key][mkey] = decodeObj2class(
              new ty["map"]["value"](),
              value[mkey]
            );
          }
        }
        // eslint-disable-next-line no-prototype-builtins
      } else if (ty !== undefined && ty.hasOwnProperty("array")) {
        for (const k in value) {
          if (ty["array"]["value"] === "string") {
            class_instance[key].push(value[k]);
          } else {
            class_instance[key].push(
              decodeObj2class(new ty["array"]["value"](), value[k])
            );
          }
        }
        // eslint-disable-next-line no-prototype-builtins
      } else if (ty !== undefined && ty.hasOwnProperty("class")) {
        // => nested_lookup_recordes:  {class: UnorderedMap, value: {class: LookupMap }},
        class_instance[key] = ty["class"].reconstruct(obj[key]);
        // eslint-disable-next-line no-prototype-builtins
        if (ty.hasOwnProperty("value")) {
          const subtype_value = ty["value"];
          class_instance[key].subtype = function () {
            // example: { collection: {reconstructor: LookupMap.reconstruct, value: 'string'}}
            // example: UnorderedMap or {class: UnorderedMap, value: 'string'}
            return subtype_value;
          };
        }
      } else if (ty !== undefined && typeof ty.reconstruct === "function") {
        class_instance[key] = ty.reconstruct(obj[key]);
      } else {
        // normal case with nested Class, such as field is truck: Truck,
        class_instance[key] = decodeObj2class(class_instance[key], obj[key]);
      }
    } else {
      class_instance[key] = obj[key];
    }
  }
  const instance_tmp = deepCopy(class_instance);

  for (key in obj) {
    if (
      typeof class_instance[key] == "object" &&
      !(class_instance[key] instanceof Date)
    ) {
      class_instance[key] = instance_tmp[key];
    }
  }
  return class_instance;
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

/**
 * A subset of NodeJS TextEncoder API
 */
export class TextEncoder {
  encode(s: string): Uint8Array {
    return env.utf8_string_to_uint8array(s);
  }
}

/**
 * A subset of NodeJS TextDecoder API. Only support utf-8 and latin1 encoding.
 */
export class TextDecoder {
  constructor(public encoding: string = "utf-8") {}

  decode(a: Uint8Array): string {
    if (this.encoding == "utf-8") {
      return env.uint8array_to_utf8_string(a);
    } else if (this.encoding == "latin1") {
      return env.uint8array_to_latin1_string(a);
    } else {
      throw new Error("unsupported encoding: " + this.encoding);
    }
  }
}

/**
 * Convert a string to Uint8Array, each character must have a char code between 0-255.
 * @param s - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
export function bytes(s: string): Uint8Array {
  return env.latin1_string_to_uint8array(s);
}

/**
 * Convert a Uint8Array to string, each uint8 to the single character of that char code
 * @param a - Uint8Array to convert
 * @returns result string
 */
export function str(a: Uint8Array): string {
  return env.uint8array_to_latin1_string(a);
}

/**
 * Encode the string to Uint8Array with UTF-8 encoding
 * @param s - String to encode
 * @returns result Uint8Array
 */
export function encode(s: string): Uint8Array {
  return env.utf8_string_to_uint8array(s);
}

/**
 * Decode the Uint8Array to string in UTF-8 encoding
 * @param a - array to decode
 * @returns result string
 */
export function decode(a: Uint8Array): string {
  return env.uint8array_to_utf8_string(a);
}

/**
 * When implemented, allow object to be stored as collection key
 */
export interface IntoStorageKey {
  into_storage_key(): string;
}

export function deepCopy<T>(obj: T): T {
  // Handle primitives and null
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  // Handle RegExp objects
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as unknown as T;
  }

  // Handle Map objects
  if (obj instanceof Map) {
    const mapCopy = new Map();
    obj.forEach((value, key) => {
      mapCopy.set(deepCopy(key), deepCopy(value));
    });
    return mapCopy as unknown as T;
  }

  // Handle Set objects
  if (obj instanceof Set) {
    const setCopy = new Set();
    obj.forEach((value) => {
      setCopy.add(deepCopy(value));
    });
    return setCopy as unknown as T;
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCopy(item)) as unknown as T;
  }

  // Handle Objects
  const copy = Object.create(Object.getPrototypeOf(obj));
  Object.getOwnPropertyNames(obj).forEach((key) => {
    copy[key] = deepCopy(obj[key]);
  });

  // Handle symbol properties
  const symbols = Object.getOwnPropertySymbols(obj);
  symbols.forEach((sym) => {
    copy[sym] = deepCopy(obj[sym]);
  });

  return copy as T;
}
