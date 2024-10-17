[**collections/lookup-set**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [collections/lookup-set](../README.md) / LookupSet

# Class: LookupSet\<DataType\>

A lookup set collection that stores entries in NEAR storage.

## Type Parameters

• **DataType**

## Constructors

### new LookupSet()

> **new LookupSet**\<`DataType`\>(`keyPrefix`): [`LookupSet`](LookupSet.md)\<`DataType`\>

#### Parameters

• **keyPrefix**: `string`

The byte prefix to use when storing elements inside this collection.

#### Returns

[`LookupSet`](LookupSet.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/lookup-set.ts:12](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-set.ts#L12)

## Properties

### keyPrefix

> `readonly` **keyPrefix**: `string`

The byte prefix to use when storing elements inside this collection.

#### Defined in

[packages/near-sdk-js/src/collections/lookup-set.ts:12](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-set.ts#L12)

## Methods

### contains()

> **contains**(`key`, `options`?): `boolean`

Checks whether the collection contains the value.

#### Parameters

• **key**: `DataType`

The value for which to check the presence.

• **options?**: `Pick`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for storing data.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-set.ts:20](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-set.ts#L20)

***

### extend()

> **extend**(`keys`, `options`?): `void`

Extends the current collection with the passed in array of elements.

#### Parameters

• **keys**: `DataType`[]

The elements to extend the collection with.

• **options?**: `Pick`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for storing the data.

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-set.ts:63](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-set.ts#L63)

***

### remove()

> **remove**(`key`, `options`?): `boolean`

Returns true if the element was present in the set.

#### Parameters

• **key**: `DataType`

The entry to remove.

• **options?**: `Pick`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for storing data.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-set.ts:34](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-set.ts#L34)

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

[packages/near-sdk-js/src/collections/lookup-set.ts:75](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-set.ts#L75)

***

### set()

> **set**(`key`, `options`?): `boolean`

If the set did not have this value present, `true` is returned.
If the set did have this value present, `false` is returned.

#### Parameters

• **key**: `DataType`

The value to store in the collection.

• **options?**: `Pick`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for storing the data.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/lookup-set.ts:49](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-set.ts#L49)

***

### reconstruct()

> `static` **reconstruct**\<`DataType`\>(`data`): [`LookupSet`](LookupSet.md)\<`DataType`\>

Converts the deserialized data from storage to a JavaScript instance of the collection.

#### Type Parameters

• **DataType**

#### Parameters

• **data**: [`LookupSet`](LookupSet.md)\<`unknown`\>

The deserialized data to create an instance from.

#### Returns

[`LookupSet`](LookupSet.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/lookup-set.ts:84](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/lookup-set.ts#L84)
