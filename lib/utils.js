import * as near from './api';
export function u8ArrayToBytes(array) {
    let ret = "";
    for (let e of array) {
        ret += String.fromCharCode(e);
    }
    return ret;
}
// TODO this function is a bit broken and the type can't be string
// TODO for more info: https://github.com/near/near-sdk-js/issues/78
export function bytesToU8Array(bytes) {
    let ret = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        ret[i] = bytes.charCodeAt(i);
    }
    return ret;
}
export function bytes(strOrU8Array) {
    if (typeof strOrU8Array == "string") {
        return checkStringIsBytes(strOrU8Array);
    }
    else if (strOrU8Array instanceof Uint8Array) {
        return u8ArrayToBytes(strOrU8Array);
    }
    throw new Error("bytes: expected string or Uint8Array");
}
function checkStringIsBytes(str) {
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
            throw new Error(`string ${str} at index ${i}: ${str[i]} is not a valid byte`);
        }
    }
    return str;
}
export function assert(b, str) {
    if (b) {
        return;
    }
    else {
        throw Error("assertion failed: " + str);
    }
}
export function assertOneYocto() {
    assert(near.attachedDeposit() == 1n, "Requires attached deposit of exactly 1 yoctoNEAR");
}
