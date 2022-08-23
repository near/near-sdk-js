export var PromiseResult;
(function (PromiseResult) {
    PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
    PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
    PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
export var PromiseError;
(function (PromiseError) {
    PromiseError[PromiseError["Failed"] = 0] = "Failed";
    PromiseError[PromiseError["NotReady"] = 1] = "NotReady";
})(PromiseError || (PromiseError = {}));
