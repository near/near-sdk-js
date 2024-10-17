[**types/public_key**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [types/public\_key](../README.md) / UnknownCurve

# Class: UnknownCurve

## Extends

- [`ParsePublicKeyError`](ParsePublicKeyError.md)

## Constructors

### new UnknownCurve()

> **new UnknownCurve**(): [`UnknownCurve`](UnknownCurve.md)

#### Returns

[`UnknownCurve`](UnknownCurve.md)

#### Overrides

[`ParsePublicKeyError`](ParsePublicKeyError.md).[`constructor`](ParsePublicKeyError.md#constructors)

#### Defined in

[packages/near-sdk-js/src/types/public\_key.ts:73](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/types/public_key.ts#L73)

## Properties

### cause?

> `optional` **cause**: `Error`

#### Inherited from

[`ParsePublicKeyError`](ParsePublicKeyError.md).[`cause`](ParsePublicKeyError.md#cause)

#### Defined in

node\_modules/.pnpm/typescript@4.7.4/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

***

### message

> **message**: `string`

#### Inherited from

[`ParsePublicKeyError`](ParsePublicKeyError.md).[`message`](ParsePublicKeyError.md#message)

#### Defined in

node\_modules/.pnpm/typescript@4.7.4/node\_modules/typescript/lib/lib.es5.d.ts:1029

***

### name

> **name**: `string`

#### Inherited from

[`ParsePublicKeyError`](ParsePublicKeyError.md).[`name`](ParsePublicKeyError.md#name)

#### Defined in

node\_modules/.pnpm/typescript@4.7.4/node\_modules/typescript/lib/lib.es5.d.ts:1028

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

[`ParsePublicKeyError`](ParsePublicKeyError.md).[`stack`](ParsePublicKeyError.md#stack)

#### Defined in

node\_modules/.pnpm/typescript@4.7.4/node\_modules/typescript/lib/lib.es5.d.ts:1030

***

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

Optional override for formatting stack traces

#### Parameters

• **err**: `Error`

• **stackTraces**: `CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

[`ParsePublicKeyError`](ParsePublicKeyError.md).[`prepareStackTrace`](ParsePublicKeyError.md#preparestacktrace)

#### Defined in

packages/near-sdk-js/node\_modules/@types/node/globals.d.ts:11

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

[`ParsePublicKeyError`](ParsePublicKeyError.md).[`stackTraceLimit`](ParsePublicKeyError.md#stacktracelimit)

#### Defined in

packages/near-sdk-js/node\_modules/@types/node/globals.d.ts:13

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt`?): `void`

Create .stack property on a target object

#### Parameters

• **targetObject**: `object`

• **constructorOpt?**: `Function`

#### Returns

`void`

#### Inherited from

[`ParsePublicKeyError`](ParsePublicKeyError.md).[`captureStackTrace`](ParsePublicKeyError.md#capturestacktrace)

#### Defined in

packages/near-sdk-js/node\_modules/@types/node/globals.d.ts:4
