import { AccountId } from "./account_id";
import { BlockHeight, EpochHeight, Balance, StorageUsage } from "./primitives";
import { PromiseResult, PromiseError, PromiseIndex, ReceiptIndex, IteratorIndex } from "./vm_types";
import { Gas, ONE_TERA_GAS } from "./gas";
import { PublicKey, CurveType, curveTypeFromStr, ParsePublicKeyError, InvalidLengthError, Base58Error, UnknownCurve } from "./public_key";
export { AccountId, BlockHeight, EpochHeight, Balance, StorageUsage, PromiseResult, PromiseError, PromiseIndex, ReceiptIndex, IteratorIndex, Gas, ONE_TERA_GAS, PublicKey, CurveType, curveTypeFromStr, ParsePublicKeyError, InvalidLengthError, Base58Error, UnknownCurve, };
export declare type GasWeight = bigint;
export declare const ONE_YOCTO: Balance;
export declare const ONE_NEAR: Balance;
