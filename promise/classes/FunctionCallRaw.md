[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / FunctionCallRaw

# Class: FunctionCallRaw

A function call raw promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new FunctionCallRaw()

> **new FunctionCallRaw**(`functionName`, `args`, `amount`, `gas`): [`FunctionCallRaw`](FunctionCallRaw.md)

#### Parameters

• **functionName**: `string`

The name of the function to be called.

• **args**: `Uint8Array`

The arguments to be passed to the function.

• **amount**: `bigint`

The amount of NEAR to attach to the call.

• **gas**: `bigint`

The amount of Gas to attach to the call.

#### Returns

[`FunctionCallRaw`](FunctionCallRaw.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:91](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L91)

## Properties

### amount

> **amount**: `bigint`

The amount of NEAR to attach to the call.

#### Defined in

[packages/near-sdk-js/src/promise.ts:94](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L94)

***

### args

> **args**: `Uint8Array`

The arguments to be passed to the function.

#### Defined in

[packages/near-sdk-js/src/promise.ts:93](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L93)

***

### functionName

> **functionName**: `string`

The name of the function to be called.

#### Defined in

[packages/near-sdk-js/src/promise.ts:92](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L92)

***

### gas

> **gas**: `bigint`

The amount of Gas to attach to the call.

#### Defined in

[packages/near-sdk-js/src/promise.ts:95](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L95)

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

[packages/near-sdk-js/src/promise.ts:100](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L100)
