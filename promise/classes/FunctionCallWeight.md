[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / FunctionCallWeight

# Class: FunctionCallWeight

A function call weight promise action.

## Extends

- [`PromiseAction`](PromiseAction.md)

## Constructors

### new FunctionCallWeight()

> **new FunctionCallWeight**(`functionName`, `args`, `amount`, `gas`, `weight`): [`FunctionCallWeight`](FunctionCallWeight.md)

#### Parameters

• **functionName**: `string`

The name of the function to be called.

• **args**: `string`

The utf-8 string arguments to be passed to the function.

• **amount**: `bigint`

The amount of NEAR to attach to the call.

• **gas**: `bigint`

The amount of Gas to attach to the call.

• **weight**: `bigint`

The weight of unused Gas to use.

#### Returns

[`FunctionCallWeight`](FunctionCallWeight.md)

#### Overrides

[`PromiseAction`](PromiseAction.md).[`constructor`](PromiseAction.md#constructors)

#### Defined in

[packages/near-sdk-js/src/promise.ts:124](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L124)

## Properties

### amount

> **amount**: `bigint`

The amount of NEAR to attach to the call.

#### Defined in

[packages/near-sdk-js/src/promise.ts:127](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L127)

***

### args

> **args**: `string`

The utf-8 string arguments to be passed to the function.

#### Defined in

[packages/near-sdk-js/src/promise.ts:126](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L126)

***

### functionName

> **functionName**: `string`

The name of the function to be called.

#### Defined in

[packages/near-sdk-js/src/promise.ts:125](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L125)

***

### gas

> **gas**: `bigint`

The amount of Gas to attach to the call.

#### Defined in

[packages/near-sdk-js/src/promise.ts:128](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L128)

***

### weight

> **weight**: `bigint`

The weight of unused Gas to use.

#### Defined in

[packages/near-sdk-js/src/promise.ts:129](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L129)

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

[packages/near-sdk-js/src/promise.ts:134](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L134)
