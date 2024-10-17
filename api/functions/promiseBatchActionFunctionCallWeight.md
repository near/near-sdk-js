[**api**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [api](../README.md) / promiseBatchActionFunctionCallWeight

# Function: promiseBatchActionFunctionCallWeight()

> **promiseBatchActionFunctionCallWeight**(`promiseIndex`, `methodName`, `args`, `amount`, `gas`, `weight`): `void`

Attach a function call with weight promise action to the NEAR promise index with the provided promise index.

## Parameters

• **promiseIndex**: [`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

The index of the promise to attach a function call with weight action to.

• **methodName**: `string`

The name of the method to be called.

• **args**: `string`

The utf-8 string arguments to call the method with.

• **amount**: [`NearAmount`](../../utils/type-aliases/NearAmount.md)

The amount of NEAR to attach to the call.

• **gas**: [`NearAmount`](../../utils/type-aliases/NearAmount.md)

The amount of Gas to attach to the call.

• **weight**: `bigint`

The weight of unused Gas to use.

## Returns

`void`

## Defined in

[packages/near-sdk-js/src/api.ts:792](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/api.ts#L792)
