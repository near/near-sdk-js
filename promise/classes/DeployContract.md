[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / DeployContract

# Class: DeployContract

A deploy contract promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new DeployContract()

> **new DeployContract**(`code`): [`DeployContract`](DeployContract.md)

#### Parameters

• **code**: `Uint8Array`

The code of the contract to be deployed.

#### Returns

[`DeployContract`](DeployContract.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:38](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L38)

## Properties

### code

> **code**: `Uint8Array`

The code of the contract to be deployed.

#### Defined in

[packages/near-sdk-js/src/promise.ts:38](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L38)

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

[packages/near-sdk-js/src/promise.ts:42](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L42)
