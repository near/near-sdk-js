import { AccountId } from "./account_id";
import { BlockHeight, EpochHeight, Balance, StorageUsage } from "./primitives";
import { PromiseResult, PromiseError, ReceiptIndex, IteratorIndex } from "./vm_types";
import { Gas, ONE_TERA_GAS } from "./gas";
import { PublicKey, CurveType, curveTypeFromStr, ParsePublicKeyError, InvalidLengthError, Base58Error, UnknownCurve } from "./public_key";
export { AccountId, BlockHeight, EpochHeight, Balance, StorageUsage, PromiseResult, PromiseError, ReceiptIndex, IteratorIndex, Gas, ONE_TERA_GAS, PublicKey, CurveType, curveTypeFromStr, ParsePublicKeyError, InvalidLengthError, Base58Error, UnknownCurve, };
/**
 * The amount of Gas Weight in integers - whole numbers.
 */
export declare type GasWeight = bigint;
/**
 * One yoctoNEAR. 10^-24 NEAR.
 */
export declare const ONE_YOCTO: Balance;
/**
 * One NEAR. 1 NEAR = 10^24 yoctoNEAR.
 */
export declare const ONE_NEAR: Balance;
