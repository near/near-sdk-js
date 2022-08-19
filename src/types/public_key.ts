import { Bytes } from "../utils";
import { base58 } from '@scure/base';

export enum CurveType {
    ED25519 = 0,
    SECP256K1 = 1,
}

function data_len(c: CurveType): number {
    switch (c) {
        case CurveType.ED25519:
            return 32;
        case CurveType.SECP256K1:
            return 64;
        default:
            throw new UnknownCurve()
    }
}

function split_key_type_data(value: string): [CurveType, string] {
    let idx = value.indexOf(":");
    if (idx >= 0) {
        return [curveTypeFromStr(value.substring(0, idx)), value.substring(idx + 1)];
    } else {
        return [CurveType.ED25519, value];
    }
}

export function curveTypeFromStr(value: string): CurveType {
    switch (value) {
        case "ed25519":
            return CurveType.ED25519;
        case "secp256k1":
            return CurveType.SECP256K1;
        default:
            throw new UnknownCurve();
    }
}

export class ParsePublicKeyError extends Error {}
export class InvalidLengthError extends ParsePublicKeyError {
    constructor(public length: number) {
        super(`Invalid length: ${length}`);
    }
}
export class Base58Error extends ParsePublicKeyError {
    constructor(public error: string) {
        super(`Base58 error: ${error}`);
    }
}
export class UnknownCurve extends ParsePublicKeyError {}

export class PublicKey {
    constructor(public data: Bytes) {
        let curve_type = data.charCodeAt(0) as CurveType
        let curve_len = data_len(curve_type)
        if (data.length != curve_len + 1) {
            throw new InvalidLengthError(data.length)
        }
        this.data = data
    }

    curve_type(): CurveType {
        return this.data.charCodeAt(0) as CurveType
    }

    static fromString(s: string) {
        let [curve, key_data] = split_key_type_data(s);
        let data = base58.decode(key_data);
        return new PublicKey(String.fromCharCode(curve) + data);
    }
}