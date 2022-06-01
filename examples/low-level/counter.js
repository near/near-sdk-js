import * as near from '../../src/api'

export function get_num() {
    let res = near.jsvmStorageRead("a")
    return res ? res : "0"
}

export function increment() {
    let n = near.jsvmStorageRead("a")
    n = n ? Number(n) + 1 : 1
    near.jsvmStorageWrite("a", String(n))
    near.log("Increased number to " + n)
}

export function decrement() {
    let n = near.jsvmStorageRead("a")
    n = n ? Number(n) - 1 : 1
    near.jsvmStorageWrite("a", String(n))
    near.log("Decreased number to " + n)
}

export function reset() {
    near.jsvmStorageWrite("a", "0")
}
