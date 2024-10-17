[**collections/unordered-set**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [collections/unordered-set](../README.md) / UnorderedSet

# Class: UnorderedSet\<DataType\>

An unordered set that stores data in NEAR storage.

## Type Parameters

• **DataType**

## Constructors

### new UnorderedSet()

> **new UnorderedSet**\<`DataType`\>(`prefix`): [`UnorderedSet`](UnorderedSet.md)\<`DataType`\>

#### Parameters

• **prefix**: `string`

The byte prefix to use when storing elements inside this collection.

#### Returns

[`UnorderedSet`](UnorderedSet.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:35](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L35)

## Properties

### \_elements

> `readonly` **\_elements**: [`Vector`](../../vector/classes/Vector.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:30](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L30)

***

### elementIndexPrefix

> `readonly` **elementIndexPrefix**: `string`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:29](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L29)

***

### prefix

> `readonly` **prefix**: `string`

The byte prefix to use when storing elements inside this collection.

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:35](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L35)

## Accessors

### length

> `get` **length**(): `number`

The number of elements stored in the collection.

#### Returns

`number`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:43](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L43)

## Methods

### \[iterator\]()

> **\[iterator\]**(): [`VectorIterator`](../../vector/classes/VectorIterator.md)\<`DataType`\>

#### Returns

[`VectorIterator`](../../vector/classes/VectorIterator.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:157](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L157)

***

### clear()

> **clear**(`options`?): `void`

Remove all of the elements stored within the collection.

#### Parameters

• **options?**: `Pick`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:147](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L147)

***

### contains()

> **contains**(`element`, `options`?): `boolean`

Checks whether the collection contains the value.

#### Parameters

• **element**: `DataType`

The value for which to check the presence.

• **options?**: `Pick`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for storing data.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:60](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L60)

***

### elements()

> **elements**(`__namedParameters`): `DataType`[]

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.limit?**: `number`

• **\_\_namedParameters.options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

• **\_\_namedParameters.start?**: `number`

#### Returns

`DataType`[]

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:230](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L230)

***

### extend()

> **extend**(`elements`): `void`

Extends the current collection with the passed in array of elements.

#### Parameters

• **elements**: `DataType`[]

The elements to extend the collection with.

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:196](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L196)

***

### isEmpty()

> **isEmpty**(): `boolean`

Checks whether the collection is empty.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:50](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L50)

***

### remove()

> **remove**(`element`, `options`?): `boolean`

Returns true if the element was present in the set.

#### Parameters

• **element**: `DataType`

The entry to remove.

• **options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

Options for retrieving and storing data.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:101](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L101)

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

[packages/near-sdk-js/src/collections/unordered-set.ts:207](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L207)

***

### set()

> **set**(`element`, `options`?): `boolean`

If the set did not have this value present, `true` is returned.
If the set did have this value present, `false` is returned.

#### Parameters

• **element**: `DataType`

The value to store in the collection.

• **options?**: `Pick`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for storing the data.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:76](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L76)

***

### toArray()

> **toArray**(`options`?): `DataType`[]

Return a JavaScript array of the data stored within the collection.

#### Parameters

• **options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

Options for retrieving and storing the data.

#### Returns

`DataType`[]

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:179](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L179)

***

### reconstruct()

> `static` **reconstruct**\<`DataType`\>(`data`): [`UnorderedSet`](UnorderedSet.md)\<`DataType`\>

Converts the deserialized data from storage to a JavaScript instance of the collection.

#### Type Parameters

• **DataType**

#### Parameters

• **data**: [`UnorderedSet`](UnorderedSet.md)\<`DataType`\>

The deserialized data to create an instance from.

#### Returns

[`UnorderedSet`](UnorderedSet.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/unordered-set.ts:216](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/unordered-set.ts#L216)
