[**api**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [api](../README.md) / promiseBatchActionDeleteAccount

# Function: promiseBatchActionDeleteAccount()

> **promiseBatchActionDeleteAccount**(`promiseIndex`, `beneficiaryId`): `void`

Attach a delete account promise action to the NEAR promise index with the provided promise index.

## Parameters

• **promiseIndex**: [`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

The index of the promise to attach a delete account action to.

• **beneficiaryId**: `string`

The account ID of the beneficiary - the account that receives the remaining amount of NEAR.

## Returns

`void`

## Defined in

[packages/near-sdk-js/src/api.ts:744](https://github.com/near/near-sdk-js/blob/dad7401ff5db9410681d25d6ee1129ed52c88da9/packages/near-sdk-js/src/api.ts#L744)
