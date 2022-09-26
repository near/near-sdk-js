import { near, bytes } from 'near-sdk-js'

export function test_sha256() {
  near.valueReturn(near.sha256(bytes('tesdsst')))
}

export function test_keccak256() {
  near.valueReturn(near.keccak256(bytes('tesdsst')))
}

export function test_keccak512() {
  near.valueReturn(near.keccak512(bytes('tesdsst')))
}

export function test_ripemd160() {
  near.valueReturn(near.ripemd160(bytes('tesdsst')))
}

export function test_ecrecover() {
  let hash = bytes(
    new Uint8Array([
      206, 6, 119, 187, 48, 186, 168, 207, 6, 124, 136, 219, 152, 17, 244, 51, 61, 19, 27, 248, 188, 241, 47, 231, 6,
      93, 33, 29, 206, 151, 16, 8,
    ])
  )
  let sign = bytes(
    new Uint8Array([
      144, 242, 123, 139, 72, 141, 176, 11, 0, 96, 103, 150, 210, 152, 127, 106, 95, 89, 174, 98, 234, 5, 239, 254, 132,
      254, 245, 184, 176, 229, 73, 152, 74, 105, 17, 57, 173, 87, 163, 240, 185, 6, 99, 118, 115, 170, 47, 99, 209, 245,
      92, 177, 166, 145, 153, 212, 0, 158, 234, 35, 206, 173, 220, 147,
    ])
  )
  let v = 1
  let malleabilityFlag = 1
  let ret = near.ecrecover(hash, sign, v, malleabilityFlag)
  near.valueReturn(ret)
}
