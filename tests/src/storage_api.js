import {near, bytes} from 'near-sdk-js'

export function test_storage_write() {
    near.valueReturn(near.storageWrite(bytes("\x00tesdsst\xff"), bytes("\x00\x01\xff")))
}

export function test_storage_read() {
    near.valueReturn(near.storageRead(bytes("\x00tesdsst\xff")))
}

export function test_storage_remove() {
    near.valueReturn(near.storageRemove(bytes("\x00tesdsst\xff")))
}

export function test_storage_has_key() {
    near.valueReturn(near.storageHasKey(bytes("\x00tesdsst\xff")))
}

export function test_storage_get_evicted() {
    near.storageWrite(bytes("\x00tesdsst\xff"), bytes("\x00\x01\xff"))
    near.storageWrite(bytes("\x00tesdsst\xff"), bytes("\x03\x01\xee"))
    near.valueReturn(near.storageGetEvicted())
}
