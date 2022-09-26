import * as near from './api'
import { GetOptions } from './types/collections'

export type Bytes = string
export type PromiseIndex = number | bigint
export type NearAmount = number | bigint
export type Register = number | bigint

export function u8ArrayToBytes(array: Uint8Array): Bytes {
  return array.reduce((result, value) => `${result}${String.fromCharCode(value)}`, '')
}

// TODO this function is a bit broken and the type can't be string
// TODO for more info: https://github.com/near/near-sdk-js/issues/78
export function bytesToU8Array(bytes: Bytes): Uint8Array {
  return Uint8Array.from([...bytes].map((byte) => byte.charCodeAt(0)))
}

export function bytes(stringOrU8Array: string | Uint8Array): Bytes {
  if (typeof stringOrU8Array === 'string') {
    return checkStringIsBytes(stringOrU8Array)
  }

  if (stringOrU8Array instanceof Uint8Array) {
    return u8ArrayToBytes(stringOrU8Array)
  }

  throw new Error('bytes: expected string or Uint8Array')
}

function checkStringIsBytes(value: string): string {
  ;[...value].forEach((character, index) => {
    assert(character.charCodeAt(0) <= 255, `string ${value} at index ${index}: ${character} is not a valid byte`)
  })

  return value
}

export function assert(expression: boolean, message: string): void {
  if (!expression) {
    throw Error('assertion failed: ' + message)
  }
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export interface IntoStorageKey {
  into_storage_key(): Bytes
}

export type Option<T> = T | null

export function assertOneYocto() {
  assert(near.attachedDeposit() == 1n, 'Requires attached deposit of exactly 1 yoctoNEAR')
}
export function getValueWithOptions<DataType>(value: unknown, options?: GetOptions<DataType>): DataType | null {
  if (value === undefined || value === null) {
    return options?.defaultValue ?? null
  }

  if (options?.reconstructor) {
    return options.reconstructor(value)
  }

  return value as DataType
}
