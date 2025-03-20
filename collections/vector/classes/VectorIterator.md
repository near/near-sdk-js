[**collections/vector**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../../packages.md) / [collections/vector](../README.md) / VectorIterator

# Class: VectorIterator\<DataType\>

An iterator for the Vector collection.

## Type Parameters

• **DataType**

## Constructors

### new VectorIterator()

> **new VectorIterator**\<`DataType`\>(`vector`, `options`?): [`VectorIterator`](VectorIterator.md)\<`DataType`\>

#### Parameters

• **vector**: [`Vector`](Vector.md)\<`DataType`\>

The vector collection to create an iterator for.

• **options?**: [`GetOptions`](../../../types/collections/interfaces/GetOptions.md)\<`DataType`\>

Options for retrieving and storing data.

#### Returns

[`VectorIterator`](VectorIterator.md)\<`DataType`\>

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:251](https://github.com/near/near-sdk-js/blob/dad7401ff5db9410681d25d6ee1129ed52c88da9/packages/near-sdk-js/src/collections/vector.ts#L251)

## Methods

### next()

> **next**(): `object`

#### Returns

`object`

##### done

> **done**: `boolean`

##### value

> **value**: `DataType`

#### Defined in

[packages/near-sdk-js/src/collections/vector.ts:256](https://github.com/near/near-sdk-js/blob/dad7401ff5db9410681d25d6ee1129ed52c88da9/packages/near-sdk-js/src/collections/vector.ts#L256)
