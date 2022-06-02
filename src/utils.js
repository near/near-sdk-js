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

export function encodeCall(contract, method, args) {
    return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
}