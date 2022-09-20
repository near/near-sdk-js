export type PromiseIndex = bigint;
export type ReceiptIndex = bigint;
export type IteratorIndex = bigint;

export enum PromiseResult {
  NotReady = 0,
  Successful = 1,
  Failed = 2,
}

export enum PromiseError {
  Failed,
  NotReady,
}
