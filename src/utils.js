export function u8ArrayToString(array) {
    let ret = ''
    for (let e of array) {
        ret += String.fromCharCode(e)
    }
    return ret
}