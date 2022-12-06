import { near } from "near-sdk-js";
import { CurveType, PublicKey } from "near-sdk-js";
import { assert } from "near-sdk-js";

function runtime_validate_public_key(prefix, public_key) {
  let promiseId = near.promiseBatchCreate(prefix + ".pk.test.near");
  near.promiseBatchActionCreateAccount(promiseId);
  near.promiseBatchActionTransfer(promiseId, 10000000000000000000000000n);
  near.promiseBatchActionAddKeyWithFullAccess(promiseId, public_key, 1n);
  near.promiseReturn(promiseId);
}

export function test_add_signer_key() {
  runtime_validate_public_key("aa", near.signerAccountPk());
}

export function test_add_ed25519_key_bytes() {
  let pk = new PublicKey(
    new Uint8Array([
      // CurveType.ED25519 = 0
      0,
      // ED25519 PublicKey data
      186, 44, 216, 49, 157, 48, 151, 47, 23, 244, 137, 69, 78, 150, 54, 42, 30,
      248, 110, 26, 205, 18, 137, 154, 10, 208, 26, 183, 65, 166, 223, 18,
    ])
  );
  runtime_validate_public_key("a", pk.data);
}

export function test_add_ed25519_key_string() {
  let k = "ed25519:DXkVZkHd7WUUejCK7i74uAoZWy1w9AZqshhTHxhmqHuB";
  let pk = PublicKey.fromString(k);
  runtime_validate_public_key("b", pk.data);
}

export function test_add_secp256k1_key_bytes() {
  let pk = new PublicKey(
    new Uint8Array([
      // CurveType.SECP256K1 = 1
      1,
      // SECP256K1 PublicKey data
      242, 86, 198, 230, 200, 11, 33, 63, 42, 160, 176, 23, 68, 35, 93, 81, 92,
      89, 68, 53, 190, 101, 27, 21, 136, 58, 16, 221, 71, 47, 166, 70, 206, 98,
      234, 243, 103, 13, 197, 203, 145, 0, 160, 202, 42, 85, 178, 193, 71, 193,
      233, 163, 140, 228, 40, 135, 142, 125, 70, 225, 251, 113, 74, 153,
    ])
  );
  runtime_validate_public_key("c", pk.data);
}

export function test_add_secp256k1_key_string() {
  let k =
    "secp256k1:5r22SrjrDvgY3wdQsnjgxkeAbU1VcM71FYvALEQWihjM3Xk4Be1CpETTqFccChQr4iJwDroSDVmgaWZv2AcXvYeL";
  let pk = PublicKey.fromString(k);
  runtime_validate_public_key("d", pk.data);
}

export function add_invalid_public_key() {
  runtime_validate_public_key(
    "e",
    new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  );
}

export function curve_type() {
  assert(
    new PublicKey(near.signerAccountPk()).curveType() == CurveType.ED25519
  );
}

export function create_invalid_curve_type() {
  new PublicKey(new Uint8Array([2, 1]));
}

export function create_invalid_length() {
  new PublicKey(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
}

export function create_from_invalid_base58() {
  PublicKey.fromString("ed25519:!@#$%^&*");
}
