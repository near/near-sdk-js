export function u8ArrayToString(array) {
    let ret = ''
    for (let e of array) {
        ret += String.fromCharCode(e)
    }
    return ret
}

export function stringToU8Array(string) {
    let ret = new Uint8Array(string.length)
    for (let i in string) {
        ret[i] = string.charCodeAt(i)
    }
    return ret
}
