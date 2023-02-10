import { near } from "near-sdk-js";

export function lowlevel_storage_write() {
    let data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    near.storageWriteRaw(data, data);
}

export function lowlevel_storage_write_many() {
    let data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    near.storageWriteRaw(data, data);
    near.storageWriteRaw(data, data);
    near.storageWriteRaw(data, data);
    near.storageWriteRaw(data, data);
    near.storageWriteRaw(data, data);
    near.storageWriteRaw(data, data);
    near.storageWriteRaw(data, data);
    near.storageWriteRaw(data, data);
    near.storageWriteRaw(data, data);
    near.storageWriteRaw(data, data);
}
