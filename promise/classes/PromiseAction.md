[**promise**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [promise](../README.md) / PromiseAction

# Class: `abstract` PromiseAction

A promise action which can be executed on the NEAR blockchain.

## Extended by

- [`CreateAccount`](CreateAccount.md)
- [`DeployContract`](DeployContract.md)
- [`FunctionCall`](FunctionCall.md)
- [`FunctionCallRaw`](FunctionCallRaw.md)
- [`FunctionCallWeight`](FunctionCallWeight.md)
- [`FunctionCallWeightRaw`](FunctionCallWeightRaw.md)
- [`Transfer`](Transfer.md)
- [`Stake`](Stake.md)
- [`AddFullAccessKey`](AddFullAccessKey.md)
- [`AddAccessKey`](AddAccessKey.md)
- [`DeleteKey`](DeleteKey.md)
- [`DeleteAccount`](DeleteAccount.md)

## Constructors

### new PromiseAction()

> **new PromiseAction**(): [`PromiseAction`](PromiseAction.md)

#### Returns

[`PromiseAction`](PromiseAction.md)

## Methods

### add()

> `abstract` **add**(`promiseIndex`): `void`

The method that describes how a promise action adds it's _action_ to the promise batch with the provided index.

#### Parameters

• **promiseIndex**: [`PromiseIndex`](../../utils/type-aliases/PromiseIndex.md)

The index of the promise batch to attach the action to.

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/promise.ts:15](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/promise.ts#L15)
