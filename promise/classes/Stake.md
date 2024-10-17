[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / Stake

# Class: Stake

A stake promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new Stake()

> **new Stake**(`amount`, `publicKey`): [`Stake`](Stake.md)

#### Parameters

• **amount**: `bigint`

The amount of NEAR to transfer.

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to use for staking.

#### Returns

[`Stake`](Stake.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:209](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L209)

## Properties

### amount

> **amount**: `bigint`

The amount of NEAR to transfer.

#### Defined in

[packages/near-sdk-js/src/promise.ts:209](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L209)

***

### publicKey

> **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to use for staking.

#### Defined in

[packages/near-sdk-js/src/promise.ts:209](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L209)

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

[packages/near-sdk-js/src/promise.ts:213](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L213)
