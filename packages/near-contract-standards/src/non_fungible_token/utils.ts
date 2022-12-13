import { near, assert, AccountId, bytes } from "near-sdk-js";

export function refund_storage_deposit(
  account_id: AccountId,
  storage_released: number
): void {
  const promise_id = near.promiseBatchCreate(account_id);
  near.promiseBatchActionTransfer(
    promise_id,
    BigInt(storage_released) * near.storageByteCost()
  );
  near.promiseReturn(promise_id);
}

export function refund_deposit_to_account(
  storage_used: bigint,
  account_id: AccountId
): void {
  const required_cost = near.storageByteCost() * storage_used;
  const attached_deposit = near.attachedDeposit();

  assert(
    required_cost <= attached_deposit,
    `Must attach ${required_cost} yoctoNEAR to cover storage`
  );

  const refund = attached_deposit - required_cost;
  if (refund > 1n) {
    const promise_id = near.promiseBatchCreate(account_id);
    near.promiseBatchActionTransfer(promise_id, refund);
    near.promiseReturn(promise_id);
  }
}

/** Assumes that the precedecessor will be refunded */
export function refund_deposit(storage_used: bigint): void {
  refund_deposit_to_account(storage_used, near.predecessorAccountId());
}

export function hash_account_id(account_id: AccountId): Uint8Array {
  return near.sha256(bytes(account_id));
}

/** Assert that at least 1 yoctoNEAR was attached. */
export function assert_at_least_one_yocto(): void {
  assert(
    near.attachedDeposit() >= 1n,
    "Requires attached deposit of at least 1 yoctoNEAR"
  );
}

/** Assert that exactly 1 yoctoNEAR was attached */
export function assert_one_yocto(): void {
  assert(
    near.attachedDeposit() === 1n,
    "Requires attached deposit of 1 yoctoNEAR"
  );
}

export type Option<T> = T | null;

export interface IntoStorageKey {
  into_storage_key(): string;
}
