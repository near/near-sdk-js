export function logMessage() {
    env.log("Creative message");
}

// Other host functions:
// env.log(...params: unknown[]): void;
// env.signerAccountId(): Bytes;
// env.currentAccountId(): Bytes;
// env.blockIndex(): bigint;
// env.blockHeight(): bigint;
// env.blockTimestamp(): bigint;
// env.epochHeight(): bigint;
// env.attachedDeposit(): bigint;
// env.prepaidGas(): bigint;
// env.accountBalance(): bigint;
// env.storageRead(key: Bytes): Bytes | null;
// env.storageHasKey(key: Bytes): boolean;
// env.storageWrite(key: Bytes, value: Bytes): boolean;
// env.storageRemove(key: Bytes): boolean;
// env.storageByteCost(): bigint;