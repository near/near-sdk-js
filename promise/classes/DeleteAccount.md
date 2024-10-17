[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / DeleteAccount

# Class: DeleteAccount

A delete account promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new DeleteAccount()

> **new DeleteAccount**(`beneficiaryId`): [`DeleteAccount`](DeleteAccount.md)

#### Parameters

• **beneficiaryId**: `string`

The beneficiary of the account deletion - the account to receive all of the remaining funds of the deleted account.

#### Returns

[`DeleteAccount`](DeleteAccount.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:306](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L306)

## Properties

### beneficiaryId

> **beneficiaryId**: `string`

The beneficiary of the account deletion - the account to receive all of the remaining funds of the deleted account.

#### Defined in

[packages/near-sdk-js/src/promise.ts:306](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L306)

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

[packages/near-sdk-js/src/promise.ts:310](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L310)
