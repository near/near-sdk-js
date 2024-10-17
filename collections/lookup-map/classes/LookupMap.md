[**collections/lookup-map**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [collections/lookup-map](../README.md) / LookupMap

# Class: LookupMap\<DataType\>

A lookup map that stores data in NEAR storage.

## Extends

- [`SubType`](../../subtype/classes/SubType.md)\<`DataType`\>

## Type Parameters

• **DataType**

## Constructors

### new LookupMap()

> **new LookupMap**\<`DataType`\>(`keyPrefix`): [`LookupMap`](LookupMap.md)\<`DataType`\>

#### Parameters

• **keyPrefix**: `string`

The byte prefix to use when storing elements inside this collection.

#### Returns

[`LookupMap`](LookupMap.md)\<`DataType`\>

#### Overrides

[`SubType`](../../subtype/classes/SubType.md).[`constructor`](../../subtype/classes/SubType.md#constructors)

#### Defined in

[packages/near-sdk-js/src/collections/lookup-map.ts:17](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-map.ts#L17)

## Properties

### keyPrefix

> `readonly` **keyPrefix**: `string`

The byte prefix to use when storing elements inside this collection.

#### Defined in

[packages/near-sdk-js/src/collections/lookup-map.ts:17](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-map.ts#L17)

## Methods

### containsKey()

> **containsKey**(`key`): `boolean`

Checks whether the collection contains the value.

#### Parameters

• **key**: `string`

The value for which to check the presence.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-map.ts:26](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-map.ts#L26)

***

### extend()

> **extend**(`keyValuePairs`, `options`?): `void`

Extends the current collection with the passed in array of key-value pairs.

#### Parameters

• **keyValuePairs**: [`string`, `DataType`][]

The key-value pairs to extend the collection with.

• **options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

Options for storing the data.

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-map.ts:102](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-map.ts#L102)

***

### get()

> **get**(`key`, `options`?): `DataType`

Get the data stored at the provided key.

#### Parameters

• **key**: `string`

The key at which to look for the data.

• **options?**: `Omit`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for retrieving the data.

#### Returns

`DataType`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-map.ts:37](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-map.ts#L37)

***

### remove()

> **remove**(`key`, `options`?): `DataType`

Removes and retrieves the element with the provided key.

#### Parameters

• **key**: `string`

The key at which to remove data.

• **options?**: `Omit`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for retrieving the data.

#### Returns

`DataType`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-map.ts:57](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-map.ts#L57)

***

### serialize()

> **serialize**(`options`?): `Uint8Array`

Serialize the collection.

#### Parameters

• **options?**: `Pick`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for storing the data.

#### Returns

`Uint8Array`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-map.ts:116](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-map.ts#L116)

***

### set()

> **set**(`key`, `newValue`, `options`?): `DataType`

Store a new value at the provided key.

#### Parameters

• **key**: `string`

The key at which to store in the collection.

• **newValue**: `DataType`

The value to store in the collection.

• **options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

Options for retrieving and storing the data.

#### Returns

`DataType`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-map.ts:79](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-map.ts#L79)

***

### set\_reconstructor()

> **set\_reconstructor**(`options`?): `Omit`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

#### Parameters

• **options?**: `Omit`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

#### Returns

`Omit`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

#### Inherited from

[`SubType`](../../subtype/classes/SubType.md).[`set_reconstructor`](../../subtype/classes/SubType.md#set_reconstructor)

#### Defined in

[packages/near-sdk-js/src/collections/subtype.ts:8](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/subtype.ts#L8)

***

### subtype()

> **subtype**(): `any`

#### Returns

`any`

#### Inherited from

[`SubType`](../../subtype/classes/SubType.md).[`subtype`](../../subtype/classes/SubType.md#subtype)

#### Defined in

[packages/near-sdk-js/src/collections/subtype.ts:6](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/subtype.ts#L6)

***

### reconstruct()

> `static` **reconstruct**\<`DataType`\>(`data`): [`LookupMap`](LookupMap.md)\<`DataType`\>

Converts the deserialized data from storage to a JavaScript instance of the collection.

#### Type Parameters

• **DataType**

#### Parameters

• **data**: [`LookupMap`](LookupMap.md)\<`unknown`\>

The deserialized data to create an instance from.

#### Returns

[`LookupMap`](LookupMap.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/lookup-map.ts:125](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-map.ts#L125)
