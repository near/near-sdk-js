[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / AddFullAccessKey

# Class: AddFullAccessKey

A add full access key promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new AddFullAccessKey()

> **new AddFullAccessKey**(`publicKey`, `nonce`): [`AddFullAccessKey`](AddFullAccessKey.md)

#### Parameters

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to add as a full access key.

• **nonce**: `bigint`

The nonce to use.

#### Returns

[`AddFullAccessKey`](AddFullAccessKey.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:232](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L232)

## Properties

### nonce

> **nonce**: `bigint`

The nonce to use.

#### Defined in

[packages/near-sdk-js/src/promise.ts:232](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L232)

***

### publicKey

> **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to add as a full access key.

#### Defined in

[packages/near-sdk-js/src/promise.ts:232](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L232)

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

[packages/near-sdk-js/src/promise.ts:236](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L236)
