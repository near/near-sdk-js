[**collections/vector**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [collections/vector](../README.md) / Vector

# Class: Vector\<DataType\>

An iterable implementation of vector that stores its content on the trie.
Uses the following map: index -> element

## Extends

- [`SubType`](../../subtype/classes/SubType.md)\<`DataType`\>

## Type Parameters

• **DataType**

## Constructors

### new Vector()

> **new Vector**\<`DataType`\>(`prefix`, `length`): [`Vector`](Vector.md)\<`DataType`\>

#### Parameters

• **prefix**: `string`

The byte prefix to use when storing elements inside this collection.

• **length**: `number` = `0`

The initial length of the collection. By default 0.

#### Returns

[`Vector`](Vector.md)\<`DataType`\>

#### Overrides

[`SubType`](../../subtype/classes/SubType.md).[`constructor`](../../subtype/classes/SubType.md#constructors)

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:31](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L31)

## Properties

### length

> **length**: `number` = `0`

The initial length of the collection. By default 0.

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:31](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L31)

***

### prefix

> `readonly` **prefix**: `string`

The byte prefix to use when storing elements inside this collection.

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:31](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L31)

## Methods

### \[iterator\]()

> **\[iterator\]**(): [`VectorIterator`](VectorIterator.md)\<`DataType`\>

#### Returns

[`VectorIterator`](VectorIterator.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:174](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L174)

***

### clear()

> **clear**(): `void`

Remove all of the elements stored within the collection.

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:211](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L211)

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

[packages/near-sdk-js/src/collections/vector.ts:168](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L168)

***

### get()

> **get**(`index`, `options`?): `DataType`

Get the data stored at the provided index.

#### Parameters

• **index**: `number`

The index at which to look for the data.

• **options?**: `Omit`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for retrieving the data.

#### Returns

`DataType`

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:48](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L48)

***

### isEmpty()

> **isEmpty**(): `boolean`

Checks whether the collection is empty.

#### Returns

`boolean`

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:38](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L38)

***

### pop()

> **pop**(`options`?): `DataType`

Removes and retrieves the element with the highest index.

#### Parameters

• **options?**: `Omit`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for retrieving the data.

#### Returns

`DataType`

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:118](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L118)

***

### push()

> **push**(`element`, `options`?): `void`

Adds data to the collection.

#### Parameters

• **element**: `DataType`

The data to store.

• **options?**: `Pick`\<[`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>, `"serializer"`\>

Options for storing the data.

#### Returns

`void`

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:100](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L100)

***

### replace()

> **replace**(`index`, `element`, `options`?): `DataType`

Replaces the data stored at the provided index with the provided data and returns the previously stored data.

#### Parameters

• **index**: `number`

The index at which to replace the data.

• **element**: `DataType`

The data to replace with.

• **options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

Options for retrieving and storing the data.

#### Returns

`DataType`

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:141](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L141)

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

[packages/near-sdk-js/src/collections/vector.ts:225](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L225)

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

### swapRemove()

> **swapRemove**(`index`, `options`?): `DataType`

Removes an element from the vector and returns it in serialized form.
The removed element is replaced by the last element of the vector.
Does not preserve ordering, but is `O(1)`.

#### Parameters

• **index**: `number`

The index at which to remove the element.

• **options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

Options for retrieving and storing the data.

#### Returns

`DataType`

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:70](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L70)

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

[packages/near-sdk-js/src/collections/vector.ts:196](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L196)

***

### reconstruct()

> `static` **reconstruct**\<`DataType`\>(`data`): [`Vector`](Vector.md)\<`DataType`\>

Converts the deserialized data from storage to a JavaScript instance of the collection.

#### Type Parameters

• **DataType**

#### Parameters

• **data**: [`Vector`](Vector.md)\<`DataType`\>

The deserialized data to create an instance from.

#### Returns

[`Vector`](Vector.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:234](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/collections/vector.ts#L234)
