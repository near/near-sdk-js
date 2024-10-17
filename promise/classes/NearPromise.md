[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / NearPromise

# Class: NearPromise

A high level class to construct and work with NEAR promises.

## Constructors

### new NearPromise()

> **new NearPromise**(`subtype`, `shouldReturn`): [`NearPromise`](NearPromise.md)

#### Parameters

• **subtype**: `PromiseSubtype`

The subtype of the promise.

• **shouldReturn**: `boolean`

Whether the promise should return.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:372](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L372)

## Methods

### addAccessKey()

> **addAccessKey**(`publicKey`, `allowance`, `receiverId`, `functionNames`): [`NearPromise`](NearPromise.md)

Creates a add access key promise action and adds it to the current promise.
Uses 0n as the nonce.

#### Parameters

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to add as a access key.

• **allowance**: `bigint`

The allowance for the key in yoctoNEAR.

• **receiverId**: `string`

The account ID of the receiver.

• **functionNames**: `string`

The names of functions to authorize.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:535](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L535)

***

### addAccessKeyWithNonce()

> **addAccessKeyWithNonce**(`publicKey`, `allowance`, `receiverId`, `functionNames`, `nonce`): [`NearPromise`](NearPromise.md)

Creates a add access key promise action and adds it to the current promise.
Allows you to specify the nonce.

#### Parameters

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to add as a access key.

• **allowance**: `bigint`

The allowance for the key in yoctoNEAR.

• **receiverId**: `string`

The account ID of the receiver.

• **functionNames**: `string`

The names of functions to authorize.

• **nonce**: `bigint`

The nonce to use.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:560](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L560)

***

### addFullAccessKey()

> **addFullAccessKey**(`publicKey`): [`NearPromise`](NearPromise.md)

Creates a add full access key promise action and adds it to the current promise.
Uses 0n as the nonce.

#### Parameters

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to add as a full access key.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:511](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L511)

***

### addFullAccessKeyWithNonce()

> **addFullAccessKeyWithNonce**(`publicKey`, `nonce`): [`NearPromise`](NearPromise.md)

Creates a add full access key promise action and adds it to the current promise.
Allows you to specify the nonce.

#### Parameters

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to add as a full access key.

• **nonce**: `bigint`

The nonce to use.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:522](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L522)

***

### and()

> **and**(`other`): [`NearPromise`](NearPromise.md)

Joins the provided promise with the current promise, making the current promise a joint promise subtype.

#### Parameters

• **other**: [`NearPromise`](NearPromise.md)

The promise to join with the current promise.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:595](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L595)

***

### asReturn()

> **asReturn**(): [`NearPromise`](NearPromise.md)

Sets the shouldReturn field to true.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:624](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L624)

***

### build()

> **build**(): [`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

Attach the promise to transaction but does not return it. The promise will be executed, but
whether it success or not will not affect the transaction result. If you want the promise fail
also makes the transaction fail, you can simply return the promise from a

#### Returns

[`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

#### Call

method.

#### Defined in

[packages/near-sdk-js/src/promise.ts:654](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L654)

***

### constructRecursively()

> **constructRecursively**(): [`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

Recursively goes through the current promise to get the promise index.

#### Returns

[`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:632](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L632)

***

### createAccount()

> **createAccount**(): [`NearPromise`](NearPromise.md)

Creates a create account promise action and adds it to the current promise.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:397](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L397)

***

### deleteAccount()

> **deleteAccount**(`beneficiaryId`): [`NearPromise`](NearPromise.md)

Creates a delete account promise action and adds it to the current promise.

#### Parameters

• **beneficiaryId**: `string`

The beneficiary of the account deletion - the account to receive all of the remaining funds of the deleted account.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:586](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L586)

***

### deleteKey()

> **deleteKey**(`publicKey`): [`NearPromise`](NearPromise.md)

Creates a delete key promise action and adds it to the current promise.

#### Parameters

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to delete from the account.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:577](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L577)

***

### deployContract()

> **deployContract**(`code`): [`NearPromise`](NearPromise.md)

Creates a deploy contract promise action and adds it to the current promise.

#### Parameters

• **code**: `Uint8Array`

The code of the contract to be deployed.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:406](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L406)

***

### functionCall()

> **functionCall**(`functionName`, `args`, `amount`, `gas`): [`NearPromise`](NearPromise.md)

Creates a function call promise action and adds it to the current promise.

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

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:418](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L418)

***

### functionCallRaw()

> **functionCallRaw**(`functionName`, `args`, `amount`, `gas`): [`NearPromise`](NearPromise.md)

Creates a function call raw promise action and adds it to the current promise.

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

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:435](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L435)

***

### functionCallWeight()

> **functionCallWeight**(`functionName`, `args`, `amount`, `gas`, `weight`): [`NearPromise`](NearPromise.md)

Creates a function call weight promise action and adds it to the current promise.

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

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:453](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L453)

***

### functionCallWeightRaw()

> **functionCallWeightRaw**(`functionName`, `args`, `amount`, `gas`, `weight`): [`NearPromise`](NearPromise.md)

Creates a function call weight raw promise action and adds it to the current promise.

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

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:474](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L474)

***

### onReturn()

> **onReturn**(): `void`

Called by NearBindgen, when return object is a NearPromise instance.

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/promise.ts:645](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L645)

***

### stake()

> **stake**(`amount`, `publicKey`): [`NearPromise`](NearPromise.md)

Creates a stake promise action and adds it to the current promise.

#### Parameters

• **amount**: `bigint`

The amount of NEAR to transfer.

• **publicKey**: [`PublicKey`](../../types/public_key/classes/PublicKey.md)

The public key to use for staking.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:501](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L501)

***

### then()

> **then**(`other`): [`NearPromise`](NearPromise.md)

Adds a callback to the current promise.

#### Parameters

• **other**: [`NearPromise`](NearPromise.md)

The promise to be executed as the promise.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:605](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L605)

***

### transfer()

> **transfer**(`amount`): [`NearPromise`](NearPromise.md)

Creates a transfer promise action and adds it to the current promise.

#### Parameters

• **amount**: `bigint`

The amount of NEAR to transfer.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:491](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L491)

***

### new()

> `static` **new**(`accountId`): [`NearPromise`](NearPromise.md)

Creates a new promise to the provided account ID.

#### Parameters

• **accountId**: `string`

The account ID on which to call the promise.

#### Returns

[`NearPromise`](NearPromise.md)

#### Defined in

[packages/near-sdk-js/src/promise.ts:379](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L379)
