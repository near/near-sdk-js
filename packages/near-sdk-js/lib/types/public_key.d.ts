export declare enum CurveType {
    ED25519 = 0,
    SECP256K1 = 1
}
export declare function curveTypeFromStr(value: string): CurveType;
export declare class ParsePublicKeyError extends Error {
}
export declare class InvalidLengthError extends ParsePublicKeyError {
    length: number;
    expectedLength: number;
    constructor(length: number, expectedLength: number);
}
export declare class Base58Error extends ParsePublicKeyError {
    error: string;
    constructor(error: string);
}
export declare class UnknownCurve extends ParsePublicKeyError {
    constructor();
}
/**
 * A abstraction on top of the NEAR public key string.
 * Public key in a binary format with base58 string serialization with human-readable curve.
 * The key types currently supported are `secp256k1` and `ed25519`.
 */
export declare class PublicKey {
    /**
     * The actual value of the public key.
     */
    data: Uint8Array;
    private type;
    /**
     * @param data - The string you want to create a PublicKey from.
     */
    constructor(data: Uint8Array);
    /**
     * The curve type of the public key.
     */
    curveType(): CurveType;
    /**
     * Create a public key from a public key string.
     *
     * @param publicKeyString - The public key string you want to create a PublicKey from.
     */
    static fromString(publicKeyString: string): PublicKey;
}
