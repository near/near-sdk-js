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
