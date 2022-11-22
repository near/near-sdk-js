// make PromiseIndex a nominal typing
var PromiseIndexBrand;
(function (PromiseIndexBrand) {
    PromiseIndexBrand[PromiseIndexBrand["_"] = -1] = "_";
})(PromiseIndexBrand || (PromiseIndexBrand = {}));
const TYPE_KEY = "typeInfo";
var TypeBrand;
(function (TypeBrand) {
    TypeBrand["BIGINT"] = "bigint";
    TypeBrand["DATE"] = "date";
})(TypeBrand || (TypeBrand = {}));
export const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
export const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
const ACCOUNT_ID_REGEX = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
export function u8ArrayToBytes(array) {
    return array.reduce((result, value) => `${result}${String.fromCharCode(value)}`, "");
}
// TODO this function is a bit broken and the type can't be string
// TODO for more info: https://github.com/near/near-sdk-js/issues/78
export function bytesToU8Array(bytes) {
    return Uint8Array.from([...bytes].map((byte) => byte.charCodeAt(0)));
}
/**
 * Accepts a string or Uint8Array and either checks for the validity of the string or converts the Uint8Array to Bytes.
 *
 * @param stringOrU8Array - The string or Uint8Array to be checked/transformed
 * @returns Safe Bytes to be used in NEAR calls.
 */
export function bytes(stringOrU8Array) {
    if (typeof stringOrU8Array === "string") {
        return checkStringIsBytes(stringOrU8Array);
    }
    if (stringOrU8Array instanceof Uint8Array) {
        return u8ArrayToBytes(stringOrU8Array);
    }
    throw new Error("bytes: expected string or Uint8Array");
}
function checkStringIsBytes(value) {
    [...value].forEach((character, index) => {
        assert(character.charCodeAt(0) <= 255, `string ${value} at index ${index}: ${character} is not a valid byte`);
    });
    return value;
}
/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
export function assert(expression, message) {
    if (!expression) {
        throw new Error("assertion failed: " + message);
    }
}
export function getValueWithOptions(value, options = {
    deserializer: deserialize,
}) {
    const deserialized = deserialize(value);
    if (deserialized === undefined || deserialized === null) {
        return options?.defaultValue ?? null;
    }
    if (options?.reconstructor) {
        return options.reconstructor(deserialized);
    }
    return deserialized;
}
export function serializeValueWithOptions(value, { serializer } = {
    serializer: serialize,
}) {
    return serializer(value);
}
export function serialize(valueToSerialize) {
    return JSON.stringify(valueToSerialize, function (key, value) {
        if (typeof value === "bigint") {
            return {
                value: value.toString(),
                [TYPE_KEY]: TypeBrand.BIGINT,
            };
        }
        if (typeof this[key] === "object" &&
            this[key] !== null &&
            this[key] instanceof Date) {
            return {
                value: this[key].toISOString(),
                [TYPE_KEY]: TypeBrand.DATE,
            };
        }
        return value;
    });
}
export function deserialize(valueToDeserialize) {
    return JSON.parse(valueToDeserialize, (_, value) => {
        if (value !== null &&
            typeof value === "object" &&
            Object.keys(value).length === 2 &&
            Object.keys(value).every((key) => ["value", TYPE_KEY].includes(key))) {
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
export function validateAccountId(accountId) {
    return (accountId.length >= 2 &&
        accountId.length <= 64 &&
        ACCOUNT_ID_REGEX.test(accountId));
}
export function u8ArrayToLatin1(array) {
    let ret = "";
    for (let e of array) {
        ret += String.fromCharCode(e);
    }
    throw new Error("bytes: expected string or Uint8Array");
    return ret;
}
