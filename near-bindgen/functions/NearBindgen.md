[**near-bindgen**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [near-bindgen](../README.md) / NearBindgen

# Function: NearBindgen()

> **NearBindgen**(`options`): `any`

Extends this class with the methods needed to make the contract storable/serializable and readable/deserializable to and from the blockchain.
Also tells the SDK to capture and expose all view, call and initialize functions.
Tells the SDK whether the contract requires initialization and whether to use a custom serialization/deserialization function when storing/reading the state.

## Parameters

• **options**

Options to configure the contract behaviour.

• **options.requireInit?**: `boolean`

Whether the contract requires initialization.

• **options.deserializer?**

Custom deserializer function to use for reading the contract state.

• **options.serializer?**

Custom serializer function to use for storing the contract state.

## Returns

`any`

## Defined in

[packages/near-sdk-js/src/near-bindgen.ts:167](https://github.com/near/near-sdk-js/blob/b58ac04fc6dff2f1120e9098c0cb059493486598/packages/near-sdk-js/src/near-bindgen.ts#L167)
