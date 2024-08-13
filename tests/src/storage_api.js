import { near, bytes } from "near-sdk-js";

// Functions consumed by the storage api tests

export function test_storage_write() {
  near.valueReturnRaw(
    bytes(
      near
        .storageWriteRaw(bytes("\x00tesdsst\xff"), bytes("\x00\x01\xff"))
        .toString()
    )
  );
}

export function test_storage_read() {
  near.valueReturnRaw(near.storageReadRaw(bytes("\x00tesdsst\xff")));
}

export function test_storage_remove() {
  near.valueReturnRaw(
    bytes(near.storageRemoveRaw(bytes("\x00tesdsst\xff")).toString())
  );
}

export function test_storage_has_key() {
  near.valueReturnRaw(
    bytes(near.storageHasKeyRaw(bytes("\x00tesdsst\xff")).toString())
  );
}

export function test_storage_get_evicted() {
  near.storageWriteRaw(bytes("\x00tesdsst\xff"), bytes("\x00\x01\xff"));
  near.storageWriteRaw(bytes("\x00tesdsst\xff"), bytes("\x03\x01\xee"));
  near.valueReturnRaw(near.storageGetEvictedRaw());
}
