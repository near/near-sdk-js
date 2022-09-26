import { near, bytes } from 'near-sdk-js'

export function log_expected_input_tests() {
  // log ascii string
  near.log('abc')
  // log string with utf-8 chars
  near.log('水') // Buffer([0xe6, 0xb0, 0xb4])
  // log number
  near.log(333)
  // log aribrary byte sequence
  near.log(bytes('\x00\x01\xff'))
  // log valid utf8 seqence
  near.log(bytes('\xe6\xb0\xb4'))

  // log valid utf8 sequence
  near.logUtf8(bytes('\xe6\xb0\xb4'))
  // log valid utf16 sequence
  near.logUtf16(bytes('\x34\x6c'))
}

export function log_unexpected_input_tests() {
  // log non-bytes with logUtf8
  near.logUtf8('水')
  // log non-bytes with logUtf16
  near.logUtf16('水')
}

export function log_invalid_utf8_sequence_test() {
  near.logUtf8(bytes('\x00\x01\xff'))
}

export function log_invalid_utf16_sequence_test() {
  near.logUtf16(bytes('\x00\x01\xff'))
}

export function storage_write_bytes() {
  near.storageWrite(bytes('abc'), bytes('def'))
  near.storageWrite(bytes('\x00\x01\xff'), bytes('\xe6\xb0\xb4'))
  near.storageWrite(bytes('\xe6\xb0\xb4'), bytes('\x00ab'))
}

export function storage_write_unexpected_input() {
  near.storageWrite('水', '水')
  near.storageWrite(123, 456)
}

export function storage_read_ascii_bytes() {
  near.valueReturn(near.storageRead(bytes('abc')))
}

export function storage_read_arbitrary_bytes_key_utf8_sequence_bytes_value() {
  near.valueReturn(near.storageRead(bytes('\x00\x01\xff')))
}

export function storage_read_utf8_sequence_bytes_key_arbitrary_bytes_value() {
  near.valueReturn(near.storageRead(bytes('\xe6\xb0\xb4')))
}

export function panic_test() {
  throw Error()
}

export function panic_ascii_test() {
  throw Error('abc')
}

export function panic_js_number() {
  throw Error(356)
}

export function panic_js_undefined() {
  throw Error(undefined)
}

export function panic_js_null() {
  throw Error(null)
}

export function panic_utf8_test() {
  throw Error('水')
}

export function panicUtf8_valid_utf8_sequence() {
  near.panicUtf8(bytes('\xe6\xb0\xb4'))
}

export function panicUtf8_invalid_utf8_sequence() {
  near.panicUtf8(bytes('\x00\x01\xff'))
}
