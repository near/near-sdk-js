/**
 * A Promise result in near can be one of:
 * - NotReady = 0 - the promise you are specifying is still not ready, not yet failed nor successful.
 * - Successful = 1 - the promise has been successfully executed and you can retrieve the resulting value.
 * - Failed = 2 - the promise execution has failed.
 */
export var PromiseResult;
(function (PromiseResult) {
    PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
    PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
    PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
/**
 * A promise error can either be due to the promise failing or not yet being ready.
 */
export var PromiseError;
(function (PromiseError) {
    PromiseError[PromiseError["Failed"] = 0] = "Failed";
    PromiseError[PromiseError["NotReady"] = 1] = "NotReady";
})(PromiseError || (PromiseError = {}));
