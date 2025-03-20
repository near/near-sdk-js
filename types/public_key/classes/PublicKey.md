[**types/public_key**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [types/public\_key](../README.md) / PublicKey

# Class: PublicKey

A abstraction on top of the NEAR public key string.
Public key in a binary format with base58 string serialization with human-readable curve.
The key types currently supported are `secp256k1` and `ed25519`.

## Constructors

### new PublicKey()

> **new PublicKey**(`data`): [`PublicKey`](PublicKey.md)

#### Parameters

• **data**: `Uint8Array`

The string you want to create a PublicKey from.

#### Returns

[`PublicKey`](PublicKey.md)

#### Defined in

[packages/near-sdk-js/src/types/public\_key.ts:93](https://github.com/near/near-sdk-js/blob/dad7401ff5db9410681d25d6ee1129ed52c88da9/packages/near-sdk-js/src/types/public_key.ts#L93)

## Properties

### data

> **data**: `Uint8Array`

The actual value of the public key.

#### Defined in

[packages/near-sdk-js/src/types/public\_key.ts:87](https://github.com/near/near-sdk-js/blob/dad7401ff5db9410681d25d6ee1129ed52c88da9/packages/near-sdk-js/src/types/public_key.ts#L87)

## Methods

### curveType()

> **curveType**(): [`CurveType`](../enumerations/CurveType.md)

The curve type of the public key.

#### Returns

[`CurveType`](../enumerations/CurveType.md)

#### Defined in

[packages/near-sdk-js/src/types/public\_key.ts:107](https://github.com/near/near-sdk-js/blob/dad7401ff5db9410681d25d6ee1129ed52c88da9/packages/near-sdk-js/src/types/public_key.ts#L107)

***

### fromString()

> `static` **fromString**(`publicKeyString`): [`PublicKey`](PublicKey.md)

Create a public key from a public key string.

#### Parameters

• **publicKeyString**: `string`

The public key string you want to create a PublicKey from.

#### Returns

[`PublicKey`](PublicKey.md)

#### Defined in

[packages/near-sdk-js/src/types/public\_key.ts:116](https://github.com/near/near-sdk-js/blob/dad7401ff5db9410681d25d6ee1129ed52c88da9/packages/near-sdk-js/src/types/public_key.ts#L116)
