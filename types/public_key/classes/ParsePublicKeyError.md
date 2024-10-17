[**types/public_key**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [types/public\_key](../README.md) / ParsePublicKeyError

# Class: ParsePublicKeyError

## Extends

- `Error`

## Extended by

- [`InvalidLengthError`](InvalidLengthError.md)
- [`Base58Error`](Base58Error.md)
- [`UnknownCurve`](UnknownCurve.md)

## Constructors

### new ParsePublicKeyError()

> **new ParsePublicKeyError**(`message`?): [`ParsePublicKeyError`](ParsePublicKeyError.md)

#### Parameters

• **message?**: `string`

#### Returns

[`ParsePublicKeyError`](ParsePublicKeyError.md)

#### Inherited from

`Error.constructor`

#### Defined in

node\_modules/.pnpm/typescript@4.7.4/node\_modules/typescript/lib/lib.es5.d.ts:1034

### new ParsePublicKeyError()

> **new ParsePublicKeyError**(`message`?, `options`?): [`ParsePublicKeyError`](ParsePublicKeyError.md)

#### Parameters

• **message?**: `string`

• **options?**: `ErrorOptions`

#### Returns

[`ParsePublicKeyError`](ParsePublicKeyError.md)

#### Inherited from

`Error.constructor`

#### Defined in

node\_modules/.pnpm/typescript@4.7.4/node\_modules/typescript/lib/lib.es5.d.ts:1034

## Properties

### cause?

> `optional` **cause**: `Error`

#### Inherited from

`Error.cause`

#### Defined in

node\_modules/.pnpm/typescript@4.7.4/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

***

### message

> **message**: `string`

#### Inherited from

`Error.message`

#### Defined in

node\_modules/.pnpm/typescript@4.7.4/node\_modules/typescript/lib/lib.es5.d.ts:1029

***

### name

> **name**: `string`

#### Inherited from

`Error.name`

#### Defined in

node\_modules/.pnpm/typescript@4.7.4/node\_modules/typescript/lib/lib.es5.d.ts:1028

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

`Error.stack`

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

`Error.prepareStackTrace`

#### Defined in

packages/near-sdk-js/node\_modules/@types/node/globals.d.ts:11

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

`Error.stackTraceLimit`

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

`Error.captureStackTrace`

#### Defined in

packages/near-sdk-js/node\_modules/@types/node/globals.d.ts:4
