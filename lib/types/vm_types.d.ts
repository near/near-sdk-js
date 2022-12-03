/**
 * The index for NEAR receipts.
 */
export type ReceiptIndex = bigint;
/**
 * The index for iterators.
 */
export type IteratorIndex = bigint;
/**
 * A Promise result in near can be one of:
 * - NotReady = 0 - the promise you are specifying is still not ready, not yet failed nor successful.
 * - Successful = 1 - the promise has been successfully executed and you can retrieve the resulting value.
 * - Failed = 2 - the promise execution has failed.
 */
export declare enum PromiseResult {
    NotReady = 0,
    Successful = 1,
    Failed = 2
}
/**
 * A promise error can either be due to the promise failing or not yet being ready.
 */
export declare enum PromiseError {
    Failed = 0,
    NotReady = 1
}
