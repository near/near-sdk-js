[**utils**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [utils](../README.md) / TextDecoder

# Class: TextDecoder

A subset of NodeJS TextDecoder API. Only support utf-8 and latin1 encoding.

## Constructors

### new TextDecoder()

> **new TextDecoder**(`encoding`): [`TextDecoder`](TextDecoder.md)

#### Parameters

• **encoding**: `string` = `"utf-8"`

#### Returns

[`TextDecoder`](TextDecoder.md)

#### Defined in

[packages/near-sdk-js/src/utils.ts:308](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/utils.ts#L308)

## Properties

### encoding

> **encoding**: `string` = `"utf-8"`

#### Defined in

[packages/near-sdk-js/src/utils.ts:308](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/utils.ts#L308)

## Methods

### decode()

> **decode**(`a`): `string`

#### Parameters

• **a**: `Uint8Array`

#### Returns

`string`

#### Defined in

[packages/near-sdk-js/src/utils.ts:310](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/utils.ts#L310)
