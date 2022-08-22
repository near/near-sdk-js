import { Bytes } from "../utils";
export declare enum CurveType {
    ED25519 = 0,
    SECP256K1 = 1
}
export declare function curveTypeFromStr(value: string): CurveType;
export declare class ParsePublicKeyError extends Error {
}
export declare class InvalidLengthError extends ParsePublicKeyError {
    length: number;
    constructor(length: number);
}
export declare class Base58Error extends ParsePublicKeyError {
    error: string;
    constructor(error: string);
}
export declare class UnknownCurve extends ParsePublicKeyError {
    constructor();
}
export declare class PublicKey {
    data: Bytes;
    constructor(data: Bytes);
    curveType(): CurveType;
    static fromString(s: string): PublicKey;
}
