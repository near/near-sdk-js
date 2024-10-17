[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / FunctionCallWeightRaw

# Class: FunctionCallWeightRaw

A function call weight raw promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new FunctionCallWeightRaw()

> **new FunctionCallWeightRaw**(`functionName`, `args`, `amount`, `gas`, `weight`): [`FunctionCallWeightRaw`](FunctionCallWeightRaw.md)

#### Parameters

• **functionName**: `string`

The name of the function to be called.

• **args**: `Uint8Array`

The arguments to be passed to the function.

• **amount**: `bigint`

The amount of NEAR to attach to the call.

• **gas**: `bigint`

The amount of Gas to attach to the call.

• **weight**: `bigint`

The weight of unused Gas to use.

#### Returns

[`FunctionCallWeightRaw`](FunctionCallWeightRaw.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:159](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L159)

## Properties

### amount

> **amount**: `bigint`

The amount of NEAR to attach to the call.

#### Defined in

[packages/near-sdk-js/src/promise.ts:162](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L162)

***

### args

> **args**: `Uint8Array`

The arguments to be passed to the function.

#### Defined in

[packages/near-sdk-js/src/promise.ts:161](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L161)

***

### functionName

> **functionName**: `string`

The name of the function to be called.

#### Defined in

[packages/near-sdk-js/src/promise.ts:160](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L160)

***

### gas

> **gas**: `bigint`

The amount of Gas to attach to the call.

#### Defined in

[packages/near-sdk-js/src/promise.ts:163](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L163)

***

### weight

> **weight**: `bigint`

The weight of unused Gas to use.

#### Defined in

[packages/near-sdk-js/src/promise.ts:164](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L164)

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

[packages/near-sdk-js/src/promise.ts:169](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L169)
