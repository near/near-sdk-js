[**api**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [api](../README.md) / promiseBatchActionAddKeyWithFunctionCall

# Function: promiseBatchActionAddKeyWithFunctionCall()

> **promiseBatchActionAddKeyWithFunctionCall**(`promiseIndex`, `publicKey`, `nonce`, `allowance`, `receiverId`, `methodNames`): `void`

Attach a add access key promise action to the NEAR promise index with the provided promise index.

## Parameters

• **promiseIndex**: [`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

The index of the promise to attach a add access key action to.

• **publicKey**: `Uint8Array`

The public key to add.

• **nonce**: `number` \| `bigint`

The nonce to use.

• **allowance**: [`NearAmount`](../../utils/type-aliases/NearAmount.md)

The allowance of the access key.

• **receiverId**: `string`

The account ID of the receiver.

• **methodNames**: `string`

The names of the method to allow the key for.

## Returns

`void`

## Defined in

[packages/near-sdk-js/src/api.ts:704](https://github.com/near/near-sdk-js/blob/dad7401ff5db9410681d25d6ee1129ed52c88da9/packages/near-sdk-js/src/api.ts#L704)
