[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / DeleteKey

# Class: DeleteKey

A delete key promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new DeleteKey()

> **new DeleteKey**(`publicKey`): [`DeleteKey`](DeleteKey.md)

#### Parameters

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to delete from the account.

#### Returns

[`DeleteKey`](DeleteKey.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:289](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L289)

## Properties

### publicKey

> **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to delete from the account.

#### Defined in

[packages/near-sdk-js/src/promise.ts:289](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L289)

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

[packages/near-sdk-js/src/promise.ts:293](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L293)
