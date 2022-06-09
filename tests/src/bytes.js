import {near, bytes} from 'near-sdk-js'

export function log_expected_input_tests() {
    // log ascii string
    near.log('abc')
    // log string with utf-8 chars
    near.log('水')
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