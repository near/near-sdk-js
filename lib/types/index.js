import { PromiseResult, PromiseError, } from "./vm_types";
import { ONE_TERA_GAS } from "./gas";
import { PublicKey, CurveType, curveTypeFromStr, ParsePublicKeyError, InvalidLengthError, Base58Error, UnknownCurve, } from "./public_key";
export { PromiseResult, PromiseError, ONE_TERA_GAS, PublicKey, CurveType, curveTypeFromStr, ParsePublicKeyError, InvalidLengthError, Base58Error, UnknownCurve, };
/**
 * One yoctoNEAR. 10^-24 NEAR.
 */
export const ONE_YOCTO = 1n;
/**
 * One NEAR. 1 NEAR = 10^24 yoctoNEAR.
 */
export const ONE_NEAR = 1000000000000000000000000n;
