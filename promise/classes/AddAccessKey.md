[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / AddAccessKey

# Class: AddAccessKey

A add access key promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new AddAccessKey()

> **new AddAccessKey**(`publicKey`, `allowance`, `receiverId`, `functionNames`, `nonce`): [`AddAccessKey`](AddAccessKey.md)

#### Parameters

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to add as a access key.

• **allowance**: `bigint`

The allowance for the key in yoctoNEAR.

• **receiverId**: `string`

The account ID of the receiver.

• **functionNames**: `string`

The names of functions to authorize.

• **nonce**: `bigint`

The nonce to use.

#### Returns

[`AddAccessKey`](AddAccessKey.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:258](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L258)

## Properties

### allowance

> **allowance**: `bigint`

The allowance for the key in yoctoNEAR.

#### Defined in

[packages/near-sdk-js/src/promise.ts:260](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L260)

***

### functionNames

> **functionNames**: `string`

The names of functions to authorize.

#### Defined in

[packages/near-sdk-js/src/promise.ts:262](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L262)

***

### nonce

> **nonce**: `bigint`

The nonce to use.

#### Defined in

[packages/near-sdk-js/src/promise.ts:263](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L263)

***

### publicKey

> **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to add as a access key.

#### Defined in

[packages/near-sdk-js/src/promise.ts:259](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L259)

***

### receiverId

> **receiverId**: `string`

The account ID of the receiver.

#### Defined in

[packages/near-sdk-js/src/promise.ts:261](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L261)

## Methods

### add()

> **add**(`promiseIndex`): `void`

The method that describes how a promise action adds it's _action_ to the promise batch with the provided index.

#### Parameters

• **promiseIndex**: [`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

The index of the promise batch to attach the action to.

#### Returns

`void`

#### Overrides

[`PromiseAction`](PromiseAction.md).[`add`](PromiseAction.md#add)

#### Defined in

[packages/near-sdk-js/src/promise.ts:268](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L268)
