import { Bytes } from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";
export declare function bytes_for_approved_account_id(account_id: string): number;
export declare function refund_approved_account_ids_iter(account_id: string, approved_account_ids: string[]): void;
export declare function refund_approved_account_ids(account_id: AccountId, approved_account_ids: {
    [approvals: string]: bigint;
}): void;
export declare function refund_deposit_to_account(storage_used: bigint, account_id: string): void;
/** Assumes that the precedecessor will be refunded */
export declare function refund_deposit(storage_used: bigint): void;
export declare function hash_account_id(account_id: string): Bytes;
/** Assert that at least 1 yoctoNEAR was attached. */
export declare function assert_at_least_one_yocto(): void;
/** Assert that exactly 1 yoctoNEAR was attached */
export declare function assert_one_yocto(): void;
export declare type Option<T> = T | null;
export interface IntoStorageKey {
    into_storage_key(): Bytes;
}
