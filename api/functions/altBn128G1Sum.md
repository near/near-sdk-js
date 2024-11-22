[**api**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [api](../README.md) / altBn128G1Sum

# Function: altBn128G1Sum()

> **altBn128G1Sum**(`value`): `Uint8Array`

Computes sum for signed g1 group elements on alt_bn128 curve \sum_i
(-1)^{sign_i} g_{1 i} should be equal result.

## Parameters

• **value**: `Uint8Array`

sequence of (sign:bool, g1:G1), where
G1 is point (x:Fq, y:Fq) on alt_bn128,
alt_bn128 is Y^2 = X^3 + 3 curve over Fq.
value` is encoded a as packed, little-endian
`[((u256, u256), ((u256, u256), (u256, u256)))]` slice.

## Returns

`Uint8Array`

sum over Fq.

## Defined in

[packages/near-sdk-js/src/api.ts:995](https://github.com/near/near-sdk-js/blob/10e6c4a207004b404f237cea5a0b56ab2aad65a1/packages/near-sdk-js/src/api.ts#L995)
