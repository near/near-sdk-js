[**collections/unordered-map**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [collections/unordered-map](../README.md) / UnorderedMap

# Class: UnorderedMap\<DataType\>

An unordered map that stores data in NEAR storage.

## Extends

- [`SubType`](../../subtype/classes/SubType.md)\<`DataType`\>

## Type Parameters

• **DataType**

## Constructors

### new UnorderedMap()

> **new UnorderedMap**\<`DataType`\>(`prefix`): [`UnorderedMap`](UnorderedMap.md)\<`DataType`\>

#### Parameters

• **prefix**: `string`

The byte prefix to use when storing elements inside this collection.

#### Returns

[`UnorderedMap`](UnorderedMap.md)\<`DataType`\>

#### Overrides

[`SubType`](../../subtype/classes/SubType.md).[`constructor`](../../subtype/classes/SubType.md#constructors)

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:27](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L27)

## Properties

### \_keys

> `readonly` **\_keys**: [`Vector`](../../vector/classes/Vector.md)\<`string`\>

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:21](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L21)

***

### prefix

> `readonly` **prefix**: `string`

The byte prefix to use when storing elements inside this collection.

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:27](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L27)

***

### values

> `readonly` **values**: [`LookupMap`](../../lookup-map/classes/LookupMap.md)\<`ValueAndIndex`\>

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:22](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L22)

## Accessors

### length

> `get` **length**(): `number`

The number of elements stored in the collection.

#### Returns

`number`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:36](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L36)

## Methods

### \[iterator\]()

> **\[iterator\]**(): `UnorderedMapIterator`\<`DataType`\>

#### Returns

`UnorderedMapIterator`\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:145](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L145)

***

### clear()

> **clear**(): `void`

Remove all of the elements stored within the collection.

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:136](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L136)

***

### extend()

> **extend**(`keyValuePairs`): `void`

Extends the current collection with the passed in array of key-value pairs.

#### Parameters

• **keyValuePairs**: [`string`, `DataType`][]

The key-value pairs to extend the collection with.

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:184](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L184)

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

[packages/near-sdk-js/src/collections/unordered-map.ts:53](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L53)

***

### isEmpty()

> **isEmpty**(): `boolean`

Checks whether the collection is empty.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:43](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L43)

***

### keys()

> **keys**(`__namedParameters`): `string`[]

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.limit**: `any`

• **\_\_namedParameters.start**: `any`

#### Returns

`string`[]

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:220](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L220)

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

[packages/near-sdk-js/src/collections/unordered-map.ts:105](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L105)

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

[packages/near-sdk-js/src/collections/unordered-map.ts:195](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L195)

***

### set()

> **set**(`key`, `value`, `options`?): `DataType`

Store a new value at the provided key.

#### Parameters

• **key**: `string`

The key at which to store in the collection.

• **value**: `DataType`

The value to store in the collection.

• **options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

Options for retrieving and storing the data.

#### Returns

`DataType`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:76](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L76)

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

### toArray()

> **toArray**(`options`?): [`string`, `DataType`][]

Return a JavaScript array of the data stored within the collection.

#### Parameters

• **options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

Options for retrieving and storing the data.

#### Returns

[`string`, `DataType`][]

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:167](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L167)

***

### reconstruct()

> `static` **reconstruct**\<`DataType`\>(`data`): [`UnorderedMap`](UnorderedMap.md)\<`DataType`\>

Converts the deserialized data from storage to a JavaScript instance of the collection.

#### Type Parameters

• **DataType**

#### Parameters

• **data**: [`UnorderedMap`](UnorderedMap.md)\<`DataType`\>

The deserialized data to create an instance from.

#### Returns

[`UnorderedMap`](UnorderedMap.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/unordered-map.ts:204](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-map.ts#L204)
