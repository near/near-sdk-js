import { AccountId } from "near-sdk-js";
export declare function refund_storage_deposit(account_id: AccountId, storage_released: number): void;
export declare function refund_deposit_to_account(storage_used: bigint, account_id: AccountId): void;
/** Assumes that the precedecessor will be refunded */
export declare function refund_deposit(storage_used: bigint): void;
export declare function hash_account_id(account_id: AccountId): Uint8Array;
/** Assert that at least 1 yoctoNEAR was attached. */
export declare function assert_at_least_one_yocto(): void;
/** Assert that exactly 1 yoctoNEAR was attached */
export declare function assert_one_yocto(): void;
export type Option<T> = T | null;
export interface IntoStorageKey {
    into_storage_key(): Uint8Array;
}
