import { base58 } from "@scure/base";
import { u8ArrayConcat } from "../utils";

export enum CurveType {
  ED25519 = 0,
  SECP256K1 = 1,
}

enum DataLength {
  ED25519 = 32,
  SECP256K1 = 64,
}

function getCurveType(curveType: CurveType | number): CurveType {
  switch (curveType) {
    case CurveType.ED25519:
    case CurveType.SECP256K1:
      return curveType;
    default:
      throw new UnknownCurve();
  }
}

function dataLength(curveType: CurveType | number): DataLength {
  switch (curveType) {
    case CurveType.ED25519:
    case CurveType.SECP256K1:
      return {
        [CurveType.ED25519]: DataLength.ED25519,
        [CurveType.SECP256K1]: DataLength.SECP256K1,
      }[curveType];
    default:
      throw new UnknownCurve();
  }
}

function splitKeyTypeData(value: string): [CurveType, string] {
  const idx = value.indexOf(":");
  if (idx >= 0) {
    return [
      curveTypeFromStr(value.substring(0, idx)),
      value.substring(idx + 1),
    ];
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
  constructor(public length: number, public expectedLength: number) {
    super(`Invalid length: ${length}. Expected: ${expectedLength}`);
  }
}
export class Base58Error extends ParsePublicKeyError {
  constructor(public error: string) {
    super(`Base58 error: ${error}`);
  }
}
export class UnknownCurve extends ParsePublicKeyError {
  constructor() {
    super("Unknown curve");
  }
}

/**
 * A abstraction on top of the NEAR public key string.
 */
export class PublicKey {
  /**
   * The actual value of the public key.
   */
  public data: Uint8Array;
  private type: CurveType;

  /**
   * @param data - The string you want to create a PublicKey from.
   */
  constructor(data: Uint8Array) {
    const curveLenght = dataLength(data[0]);

    if (data.length !== curveLenght + 1) {
      throw new InvalidLengthError(data.length, curveLenght + 1);
    }

    this.type = getCurveType(data[0]);
    this.data = data;
  }

  /**
   * The curve type of the public key.
   */
  curveType(): CurveType {
    return this.type;
  }

  /**
   * Create a public key from a public key string.
   *
   * @param publicKeyString - The public key string you want to create a PublicKey from.
   */
  static fromString(publicKeyString: string) {
    const [curve, keyData] = splitKeyTypeData(publicKeyString);
    let data: Uint8Array;

    try {
      data = base58.decode(keyData);
    } catch (error) {
      throw new Base58Error(error.message);
    }

    return new PublicKey(u8ArrayConcat(new Uint8Array([curve]), data));
  }
}
