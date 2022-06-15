export function u8ArrayToBytes(array) {
    let ret = ''
    for (let e of array) {
        ret += String.fromCharCode(e)
    }
    return ret
}

export function bytesToU8Array(bytes) {
    let ret = new Uint8Array(bytes.length)
    for (let i in bytes) {
        ret[i] = bytes.charCodeAt(i)
    }
    return ret
}

export function bytes(strOrU8Array) {
    if (typeof strOrU8Array == "string") {
        return checkStringIsBytes(strOrU8Array)
    } else if (strOrU8Array instanceof Uint8Array) {
        return u8ArrayToBytes(strOrU8Array)
    }
    throw new Error('bytes: expected string or Uint8Array')
}

function checkStringIsBytes(str) {
    for (let i in str) {
        if (str.charCodeAt(i) > 255) {
            throw new Error(`string ${str} at index ${i}: ${str[i]} is not a valid byte`)
        }
    }
    return str
}