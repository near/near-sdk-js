[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / FunctionCall

# Class: FunctionCall

A function call promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new FunctionCall()

> **new FunctionCall**(`functionName`, `args`, `amount`, `gas`): [`FunctionCall`](FunctionCall.md)

#### Parameters

• **functionName**: `string`

The name of the function to be called.

• **args**: `string`

The utf-8 string arguments to be passed to the function.

• **amount**: `bigint`

The amount of NEAR to attach to the call.

• **gas**: `bigint`

The amount of Gas to attach to the call.

#### Returns

[`FunctionCall`](FunctionCall.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:59](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L59)

## Properties

### amount

> **amount**: `bigint`

The amount of NEAR to attach to the call.

#### Defined in

[packages/near-sdk-js/src/promise.ts:62](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L62)

***

### args

> **args**: `string`

The utf-8 string arguments to be passed to the function.

#### Defined in

[packages/near-sdk-js/src/promise.ts:61](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L61)

***

### functionName

> **functionName**: `string`

The name of the function to be called.

#### Defined in

[packages/near-sdk-js/src/promise.ts:60](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L60)

***

### gas

> **gas**: `bigint`

The amount of Gas to attach to the call.

#### Defined in

[packages/near-sdk-js/src/promise.ts:63](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L63)

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

[packages/near-sdk-js/src/promise.ts:68](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L68)
