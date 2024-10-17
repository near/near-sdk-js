[**types/collections**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [types/collections](../README.md) / GetOptions

# Interface: GetOptions\<DataType\>

Options for retrieving and storing data in the SDK collections.

## Type Parameters

• **DataType**

## Properties

### defaultValue?

> `optional` **defaultValue**: `DataType`

A default value to return if the original value is not present or null.

#### Defined in

[packages/near-sdk-js/src/types/collections.ts:14](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/types/collections.ts#L14)

## Methods

### deserializer()?

> `optional` **deserializer**(`valueToDeserialize`): `unknown`

A deserializer function to customize the deserialization of values after reading from NEAR storage for this call.

#### Parameters

• **valueToDeserialize**: `Uint8Array`

The Uint8Array retrieved from NEAR storage to deserialize.

#### Returns

`unknown`

#### Defined in

[packages/near-sdk-js/src/types/collections.ts:26](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/types/collections.ts#L26)

***

### reconstructor()?

> `optional` **reconstructor**(`value`): `DataType`

A constructor function to call after deserializing a value. Typically this is a constructor of the class you are storing.

#### Parameters

• **value**: `unknown`

The value returned from deserialization - either the provided `deserializer` or default deserialization function.

#### Returns

`DataType`

#### Defined in

[packages/near-sdk-js/src/types/collections.ts:10](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/types/collections.ts#L10)

***

### serializer()?

> `optional` **serializer**(`valueToSerialize`): `Uint8Array`

A serializer function to customize the serialization of the collection for this call.

#### Parameters

• **valueToSerialize**: `unknown`

The value that will be serialized - either the `DataType` or a unknown value.

#### Returns

`Uint8Array`

#### Defined in

[packages/near-sdk-js/src/types/collections.ts:20](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/types/collections.ts#L20)
