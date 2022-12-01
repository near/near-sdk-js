/**
 * The amount of storage used in yoctoNEAR.
 */
export type StorageUsage = bigint;
/**
 * A large integer representing the block height.
 */
export type BlockHeight = bigint;
/**
 * A large integer representing the epoch height.
 */
export type EpochHeight = bigint;
/**
 * The amount of tokens in yoctoNEAR.
 */
export type Balance = bigint;
/**
 * A large integer representing the nonce.
 */
export type Nonce = bigint;
/**
 * The amount of Gas Weight in integers - whole numbers.
 */
 export type GasWeight = bigint;
 /**
  * One yoctoNEAR. 10^-24 NEAR.
  */
 export const ONE_YOCTO: Balance = 1n;
 /**
  * One NEAR. 1 NEAR = 10^24 yoctoNEAR.
  */
 export const ONE_NEAR: Balance = 1_000_000_000_000_000_000_000_000n;
 