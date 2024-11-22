[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / Transfer

# Class: Transfer

A transfer promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new Transfer()

> **new Transfer**(`amount`): [`Transfer`](Transfer.md)

#### Parameters

• **amount**: `bigint`

The amount of NEAR to transfer.

#### Returns

[`Transfer`](Transfer.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:190](https://github.com/near/near-sdk-js/blob/10e6c4a207004b404f237cea5a0b56ab2aad65a1/packages/near-sdk-js/src/promise.ts#L190)

## Properties

### amount

> **amount**: `bigint`

The amount of NEAR to transfer.

#### Defined in

[packages/near-sdk-js/src/promise.ts:190](https://github.com/near/near-sdk-js/blob/10e6c4a207004b404f237cea5a0b56ab2aad65a1/packages/near-sdk-js/src/promise.ts#L190)

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

[packages/near-sdk-js/src/promise.ts:194](https://github.com/near/near-sdk-js/blob/10e6c4a207004b404f237cea5a0b56ab2aad65a1/packages/near-sdk-js/src/promise.ts#L194)
