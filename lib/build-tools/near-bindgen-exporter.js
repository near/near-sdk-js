import * as t from "@babel/types";
const methodTypes = ["call", "view", "initialize"];
function throwError(message) {
    return t.blockStatement([
        t.throwStatement(t.newExpression(t.identifier("Error"), [t.stringLiteral(message)])),
    ]);
}
function readState(classId) {
    return t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("_state"), t.callExpression(t.memberExpression(classId, t.identifier("_getState")), [])),
    ]);
}
function preventDoubleInit(methodType) {
    if (methodType !== "initialize") {
        return t.emptyStatement();
    }
    return t.ifStatement(t.identifier("_state"), throwError("Contract already initialized"));
}
function ensureInitBeforeCall(classId, methodType) {
    if (!["call", "view"].includes(methodType)) {
        return t.emptyStatement();
    }
    return t.ifStatement(t.logicalExpression("&&", t.unaryExpression("!", t.identifier("_state")), t.callExpression(t.memberExpression(classId, t.identifier("_requireInit")), [])), throwError("Contract must be initialized"));
}
function initializeContractClass(classId) {
    return t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("_contract"), t.callExpression(t.memberExpression(classId, t.identifier("_create")), [])),
    ]);
}
function reconstructState(classId, methodType) {
    if (!["call", "view"].includes(methodType)) {
        return t.emptyStatement();
    }
    return t.ifStatement(t.identifier("_state"), t.blockStatement([
        t.expressionStatement(t.callExpression(t.memberExpression(classId, t.identifier("_reconstruct")), [t.identifier("_contract"), t.identifier("_state")])),
    ]));
}
function collectArguments(classId) {
    return t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("_args"), t.callExpression(t.memberExpression(classId, t.identifier("_getArgs")), [])),
    ]);
}
function callContractMethod(methodName) {
    return t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("_result"), t.callExpression(t.memberExpression(t.identifier("_contract"), t.identifier(methodName)), [t.identifier("_args")])),
    ]);
}
function saveToStorage(classId, methodType) {
    if (!["initialize", "call"].includes(methodType)) {
        return t.emptyStatement();
    }
    return t.expressionStatement(t.callExpression(t.memberExpression(classId, t.identifier("_saveToStorage")), [t.identifier("_contract")]));
}
function executePromise(classId) {
    return t.ifStatement(t.binaryExpression("!==", t.identifier("_result"), t.identifier("undefined")), t.ifStatement(t.logicalExpression("&&", t.logicalExpression("&&", t.identifier("_result"), t.memberExpression(t.identifier("_result"), t.identifier("constructor"))), t.binaryExpression("===", t.memberExpression(t.memberExpression(t.identifier("_result"), t.identifier("constructor")), t.identifier("name")), t.stringLiteral("NearPromise"))), t.expressionStatement(t.callExpression(t.memberExpression(t.identifier("_result"), t.identifier("onReturn")), [])), t.expressionStatement(t.callExpression(t.memberExpression(t.identifier("env"), t.identifier("value_return")), [
        t.callExpression(t.memberExpression(classId, t.identifier("_serialize")), [t.identifier("_result")]),
    ]))));
}
export default function () {
    return {
        visitor: {
            ClassDeclaration(path) {
                const classNode = path.node;
                if (classNode.decorators &&
                    classNode.decorators[0].expression.callee.name === "NearBindgen") {
                    const classId = classNode.id;
                    const contractMethods = {};
                    for (let child of classNode.body.body) {
                        if (child.type === "ClassMethod" &&
                            child.kind === "method" &&
                            child.decorators) {
                            const methodType = child.decorators[0].expression.callee.name;
                            if (methodTypes.includes(methodType)) {
                                contractMethods[child.key.name] = methodType;
                            }
                        }
                    }
                    for (let methodName of Object.keys(contractMethods)) {
                        path.insertAfter(t.exportNamedDeclaration(t.functionDeclaration(t.identifier(methodName), [], t.blockStatement([
                            // Read the state of the contract from storage.
                            // const _state = Counter._getState();
                            readState(classId),
                            // Throw if initialized on any subsequent init function calls.
                            // if (_state) { throw new Error('Contract already initialized'); }
                            preventDoubleInit(contractMethods[methodName]),
                            // Throw if NOT initialized on any non init function calls.
                            // if (!_state) { throw new Error('Contract must be initialized'); }
                            ensureInitBeforeCall(classId, contractMethods[methodName]),
                            // Create instance of contract by calling _create function.
                            // let _contract = Counter._create();
                            initializeContractClass(classId),
                            // Reconstruct the contract with the state if the state is valid.
                            // if (_state) { Counter._reconstruct(_contract, _state); }
                            reconstructState(classId, contractMethods[methodName]),
                            // Collect the arguments sent to the function.
                            // const _args = Counter._getArgs();
                            collectArguments(classId),
                            // Perform the actual function call to the appropriate contract method.
                            // const _result = _contract.method(args);
                            callContractMethod(methodName),
                            // If the method called is either an initialize or call method type, save the changes to storage.
                            // Counter._saveToStorage(_contract);
                            saveToStorage(classId, contractMethods[methodName]),
                            // If a NearPromise is returned from the function call the onReturn method to execute the promise.
                            // if (_result !== undefined)
                            //   if (_result && _result.constructor && _result.constructor.name === 'NearPromise')
                            //     _result.onReturn();
                            //   else
                            //     near.valueReturn(_contract._serialize(result));
                            executePromise(classId),
                        ]))));
                        console.log(`Babel ${methodName} method export done`);
                    }
                }
            },
        },
    };
}
