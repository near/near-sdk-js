[**api**](../README.md) • **Docs**

***

[near-sdk-js v2.0.0](../../packages.md) / [api](../README.md) / altBn128PairingCheck

# Function: altBn128PairingCheck()

> **altBn128PairingCheck**(`value`): `boolean`

Computes pairing check on alt_bn128 curve.
\sum_i e(g_{1 i}, g_{2 i}) should be equal one (in additive notation), e(g1, g2) is Ate pairing

## Parameters

• **value**: `Uint8Array`

sequence of (g1:G1, g2:G2), where
G2 is Fr-ordered subgroup point (x:Fq2, y:Fq2) on alt_bn128 twist,
alt_bn128 twist is Y^2 = X^3 + 3/(i+9) curve over Fq2
Fq2 is complex field element (re: Fq, im: Fq)
G1 is point (x:Fq, y:Fq) on alt_bn128,
alt_bn128 is Y^2 = X^3 + 3 curve over Fq
`value` is encoded a as packed, little-endian
`[((u256, u256), ((u256, u256), (u256, u256)))]` slice.

## Returns

`boolean`

whether pairing check pass

## Defined in

[packages/near-sdk-js/src/api.ts:1015](https://github.com/near/near-sdk-js/blob/10e6c4a207004b404f237cea5a0b56ab2aad65a1/packages/near-sdk-js/src/api.ts#L1015)
