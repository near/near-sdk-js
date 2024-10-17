[**api**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [api](../README.md) / promiseCreate

# Function: promiseCreate()

> **promiseCreate**(`accountId`, `methodName`, `args`, `amount`, `gas`): [`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

Create a NEAR promise call to a contract on the blockchain.

## Parameters

• **accountId**: `string`

The account ID of the target contract.

• **methodName**: `string`

The name of the method to be called.

• **args**: `string`

The utf-8 string arguments to call the method with.

• **amount**: [`NearAmount`](../../utils/type-aliases/NearAmount.md)

The amount of NEAR attached to the call.

• **gas**: [`NearAmount`](../../utils/type-aliases/NearAmount.md)

The amount of Gas attached to the call.

## Returns

[`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

## Defined in

[packages/near-sdk-js/src/api.ts:464](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/api.ts#L464)
