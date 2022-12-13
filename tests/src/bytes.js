import { near, bytes, str, encode, decode, assert } from "near-sdk-js";

export function log_expected_input_tests() {
  // log ascii string
  near.log("abc");
  // log string with utf-8 chars
  near.log("水"); // Buffer([0xe6, 0xb0, 0xb4])
  // log number
  near.log(333);
  // log aribrary byte sequence
  near.log("\x00\x01\xff");
  // log valid utf8 seqence
  near.log("\xe6\xb0\xb4");

  // log valid utf8 sequence
  near.logUtf8(bytes("\xe6\xb0\xb4"));
  // log valid utf16 sequence
  near.logUtf16(bytes("\x34\x6c"));
}

export function log_unexpected_input_tests() {
  // log non-bytes with logUtf8
  near.logUtf8("水");
  // log non-bytes with logUtf16
  near.logUtf16("水");
}

export function log_invalid_utf8_sequence_test() {
  near.logUtf8(bytes("\x00\x01\xff"));
}

export function log_invalid_utf16_sequence_test() {
  near.logUtf16(bytes("\x00\x01\xff"));
}

export function storage_write_bytes() {
  near.storageWriteRaw(bytes("abc"), bytes("def"));
  near.storageWriteRaw(bytes("\x00\x01\xff"), bytes("\xe6\xb0\xb4"));
  near.storageWriteRaw(bytes("\xe6\xb0\xb4"), bytes("\x00ab"));
}

export function storage_write_utf8() {
  near.storageWrite("水", "😂");
}

export function storage_read_utf8() {
  near.valueReturn(near.storageRead("水"));
}

export function storage_read_ascii_bytes() {
  near.valueReturn(near.storageRead("abc"));
}

export function storage_read_arbitrary_bytes_key_utf8_sequence_bytes_value() {
  near.valueReturnRaw(near.storageReadRaw(bytes("\x00\x01\xff")));
}

export function storage_read_utf8_sequence_bytes_key_arbitrary_bytes_value() {
  near.valueReturnRaw(near.storageReadRaw(bytes("\xe6\xb0\xb4")));
}

export function panic_test() {
  throw Error();
}

export function panic_ascii_test() {
  throw Error("abc");
}

export function panic_js_number() {
  throw Error(356);
}

export function panic_js_undefined() {
  throw Error(undefined);
}

export function panic_js_null() {
  throw Error(null);
}

export function panic_utf8_test() {
  throw Error("水");
}

export function panicUtf8_valid_utf8_sequence() {
  near.panicUtf8(bytes("\xe6\xb0\xb4"));
}

export function panicUtf8_invalid_utf8_sequence() {
  near.panicUtf8(bytes("\x00\x01\xff"));
}

const areEqual = (first, second) =>
  first.length === second.length &&
  first.every((value, index) => value === second[index]);

export function utf8_string_to_uint8array_tests() {
  let utf8chars = "水😂";
  let withUtf8CharCodeSeq = "\xe6\xb0\xb4";
  let withArbitraryLatinSeq = "\x00\x01\xff";

  assert(
    areEqual(
      encode(utf8chars),
      new Uint8Array([230, 176, 180, 240, 159, 152, 130])
    )
  );
  assert(
    areEqual(
      encode(withUtf8CharCodeSeq),
      new Uint8Array([195, 166, 194, 176, 194, 180])
    )
  );
  assert(
    areEqual(encode(withArbitraryLatinSeq), new Uint8Array([0, 1, 195, 191]))
  );

  assert(decode(encode(utf8chars)) == utf8chars);
  assert(decode(encode(withUtf8CharCodeSeq)) == withUtf8CharCodeSeq);
  assert(decode(encode(withArbitraryLatinSeq)) == withArbitraryLatinSeq);
}

export function uint8array_to_utf8_string_tests() {
  let validUtf8SeqArray = new Uint8Array([230, 176, 180, 240, 159, 152, 130]);
  let escapedUtf8SeqArray = new Uint8Array([195, 166, 194, 176, 194, 180]);
  let invalidUtf8Seq = new Uint8Array([0, 1, 255]);

  assert(decode(validUtf8SeqArray) == "水😂");
  assert(decode(escapedUtf8SeqArray) == "\xe6\xb0\xb4");
  // same behavior as nodejs
  assert(decode(invalidUtf8Seq) == "\x00\x01\ufffd");

  assert(areEqual(encode(decode(validUtf8SeqArray)), validUtf8SeqArray));
  assert(areEqual(encode(decode(escapedUtf8SeqArray)), escapedUtf8SeqArray));
  // same behavior as nodejs
  assert(
    areEqual(
      encode(decode(invalidUtf8Seq)),
      new Uint8Array([0, 1, 239, 191, 189])
    )
  );
}

export function uint8array_to_latin1_string_tests() {
  let happensToBeUtf8Seq = new Uint8Array([230, 176, 180]);
  let validLatin1InvalidUtf8 = new Uint8Array([0, 1, 255]);
  let ascii = new Uint8Array([65, 66, 67]);

  assert(str(happensToBeUtf8Seq) == "\xe6\xb0\xb4");
  assert(str(validLatin1InvalidUtf8) == "\x00\x01\xff");
  assert(str(ascii) == "\x41\x42\x43");

  assert(areEqual(bytes(str(happensToBeUtf8Seq)), happensToBeUtf8Seq));
  assert(areEqual(bytes(str(validLatin1InvalidUtf8)), validLatin1InvalidUtf8));
  assert(areEqual(bytes(str(ascii)), ascii));
}
