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
/**
 * Convert a Uint8Array to string, use Latin1 encoding
 * @param array - Uint8Array to convert
 * @returns result string
 */
export function u8ArrayToLatin1(array) {
    let ret = "";
    for (const e of array) {
        ret += String.fromCharCode(e);
    }
    return ret;
}
/**
 * Convert a Latin1 string to Uint8Array
 * @param latin1 - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
export function latin1ToU8Array(latin1) {
    const ret = new Uint8Array(latin1.length);
    for (let i = 0; i < latin1.length; i++) {
        const code = latin1.charCodeAt(i);
        if (code > 255) {
            throw new Error(`string at index ${i}: ${latin1[i]} is not a valid latin1 char`);
        }
        ret[i] = code;
    }
    return ret;
}
/**
 * Concat two Uint8Array
 * @param array1
 * @param array2
 * @returns the concatenation of two array
 */
export function u8ArrayConcat(array1, array2) {
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
    return latin1ToU8Array(JSON.stringify(valueToSerialize, function (key, value) {
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
    }));
}
export function deserialize(valueToDeserialize) {
    return JSON.parse(u8ArrayToLatin1(valueToDeserialize), (_, value) => {
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
