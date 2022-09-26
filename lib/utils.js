import * as near from './api';
export function u8ArrayToBytes(array) {
    return array.reduce((result, value) => `${result}${String.fromCharCode(value)}`, '');
}
// TODO this function is a bit broken and the type can't be string
// TODO for more info: https://github.com/near/near-sdk-js/issues/78
export function bytesToU8Array(bytes) {
    return Uint8Array.from([...bytes].map((byte) => byte.charCodeAt(0)));
}
export function bytes(stringOrU8Array) {
    if (typeof stringOrU8Array === 'string') {
        return checkStringIsBytes(stringOrU8Array);
    }
    if (stringOrU8Array instanceof Uint8Array) {
        return u8ArrayToBytes(stringOrU8Array);
    }
    throw new Error('bytes: expected string or Uint8Array');
}
function checkStringIsBytes(value) {
    ;
    [...value].forEach((character, index) => {
        assert(character.charCodeAt(0) <= 255, `string ${value} at index ${index}: ${character} is not a valid byte`);
    });
    return value;
}
export function assert(expression, message) {
    if (!expression) {
        throw Error('assertion failed: ' + message);
    }
}
export function assertOneYocto() {
    assert(near.attachedDeposit() == 1n, 'Requires attached deposit of exactly 1 yoctoNEAR');
}
export function getValueWithOptions(value, options) {
    if (value === undefined || value === null) {
        return options?.defaultValue ?? null;
    }
    if (options?.reconstructor) {
        return options.reconstructor(value);
    }
    return value;
}
