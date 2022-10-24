import * as t from "@babel/types";
import signal from "signale";
const { Signale } = signal;
/**
 * A list of supported method types/decorators.
 */
const methodTypes = ["call", "view", "initialize"];
/**
 * A helper function that inserts a new throw Error statement with
 * the passed message.
 *
 * @param message - The message to throw inside the error
 */
function throwError(message) {
    return t.blockStatement([
        t.throwStatement(t.newExpression(t.identifier("Error"), [t.stringLiteral(message)])),
    ]);
}
/**
 * A helper function that inserts a new state reading expression.
 * It reads state into _\_state_ via _\_getState_.
 *
 * ```typescript
 * const _state = Contract._getState();
 * ```
 *
 * @param classId - The class ID of the class which we are extending.
 */
function readState(classId) {
    return t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("_state"), t.callExpression(t.memberExpression(classId, t.identifier("_getState")), [])),
    ]);
}
/**
 * A helper function that inserts a double initialization check.
 *
 * ```typescript
 * if (_state) {
 *   throw new Error('Contract already initialized');
 * }
 * ```
 *
 * @param methodType - The type of the method being called.
 */
function preventDoubleInit(methodType) {
    if (methodType !== "initialize") {
        return t.emptyStatement();
    }
    return t.ifStatement(t.identifier("_state"), throwError("Contract already initialized"));
}
/**
 * A helper function that inserts a initialization check.
 *
 * ```typescript
 * if (!_state) {
 *   throw new Error('Contract must be initialized');
 * }
 * ```
 *
 * @param classId - The class ID of the class being extended.
 * @param methodType - The type of the method being called.
 *
 * @returns {t.EmptyStatement | t.IfStatement}
 */
function ensureInitBeforeCall(classId, methodType) {
    if (!["call", "view"].includes(methodType)) {
        return t.emptyStatement();
    }
    return t.ifStatement(t.logicalExpression("&&", t.unaryExpression("!", t.identifier("_state")), t.callExpression(t.memberExpression(classId, t.identifier("_requireInit")), [])), throwError("Contract must be initialized"));
}
/**
 * A helper function that inserts a contract creation expression.
 * It creates a new instance of the class by calling the _\_create_ method
 * on the contract class.
 *
 * ```typescript
 * let _contract = Contract._create();
 * ```
 *
 * @param classId - The class ID of the class being extended.
 */
function initializeContractClass(classId) {
    return t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("_contract"), t.callExpression(t.memberExpression(classId, t.identifier("_create")), [])),
    ]);
}
/**
 * A helper function that inserts a state reconstruction statement.
 * It calls the _\_reconstruct_ method on the _\_contract_ object.
 *
 * ```typescript
 * if (_state) {
 *   Contract._reconstruct(_contract, _state);
 * }
 * ```
 * @param classId - The class ID of the class being extended.
 * @param methodType - The type of the method being called.
 */
function reconstructState(classId, methodType) {
    if (!["call", "view"].includes(methodType)) {
        return t.emptyStatement();
    }
    return t.ifStatement(t.identifier("_state"), t.blockStatement([
        t.expressionStatement(t.callExpression(t.memberExpression(classId, t.identifier("_reconstruct")), [t.identifier("_contract"), t.identifier("_state")])),
    ]));
}
/**
 * A helper function that inserts a argument collection expression.
 * It calls the _\_getArgs_ function on the class object.
 *
 * ```typescript
 * const _args = Contract._getArgs();
 * ```
 * @param classId - The class ID of the class being extended.
 */
function collectArguments(classId) {
    return t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("_args"), t.callExpression(t.memberExpression(classId, t.identifier("_getArgs")), [])),
    ]);
}
/**
 * A helper function that inserts a contract method call expresion.
 * It calls the appropriate contract method and passes the collected _\_args_.
 *
 * ```typescript
 * const _result = _contract.method(args);
 * ```
 *
 * @param methodName - The name of the method being called.
 */
function callContractMethod(methodName) {
    return t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("_result"), t.callExpression(t.memberExpression(t.identifier("_contract"), t.identifier(methodName)), [t.identifier("_args")])),
    ]);
}
/**
 * A helper function that inserts a save to storage expression.
 * It calls the _\_saveToStorage_ method if a initialize or call method is called.
 *
 * ```typescript
 * Contract._saveToStorage(_contract);
 * ```
 *
 * @param classId - The class ID of the class being extended.
 * @param methodType - The type of the method being called.
 */
function saveToStorage(classId, methodType) {
    if (!["initialize", "call"].includes(methodType)) {
        return t.emptyStatement();
    }
    return t.expressionStatement(t.callExpression(t.memberExpression(classId, t.identifier("_saveToStorage")), [t.identifier("_contract")]));
}
/**
 * A helper function that inserts a NearPromise execution call or a valuer return call.
 * It checks for the return type of the called function and either performs a NearPromise
 * _onReturn_ call or a _value\_return_ environment function to return the value to the callee.
 *
 * ```typescript
 * if (_result !== undefined) {
 *   if (_result && _result.constructor && _result.constructor.name === 'NearPromise') {
 *     _result.onReturn();
 *   } else {
 *     near.valueReturn(_contract._serialize(result));
 *   }
 * }
 * ```
 *
 * @param classId - The class ID of the class being extended.
 */
function executePromise(classId) {
    return t.ifStatement(t.binaryExpression("!==", t.identifier("_result"), t.identifier("undefined")), t.ifStatement(t.logicalExpression("&&", t.logicalExpression("&&", t.identifier("_result"), t.memberExpression(t.identifier("_result"), t.identifier("constructor"))), t.binaryExpression("===", t.memberExpression(t.memberExpression(t.identifier("_result"), t.identifier("constructor")), t.identifier("name")), t.stringLiteral("NearPromise"))), t.expressionStatement(t.callExpression(t.memberExpression(t.identifier("_result"), t.identifier("onReturn")), [])), t.expressionStatement(t.callExpression(t.memberExpression(t.identifier("env"), t.identifier("value_return")), [
        t.callExpression(t.memberExpression(classId, t.identifier("_serialize")), [t.identifier("_result"), t.booleanLiteral(true)]),
    ]))));
}
/**
 * A helper function that inserts the overriden function declaration into the class.
 *
 * @param classId - The class ID of the class being extended.
 * @param methodName - The name of the method being called.
 * @param methodType - The type of the method being called.
 */
function createDeclaration(classId, methodName, methodType) {
    return t.exportNamedDeclaration(t.functionDeclaration(t.identifier(methodName), [], t.blockStatement([
        // Read the state of the contract from storage.
        // const _state = Contract._getState();
        readState(classId),
        // Throw if initialized on any subsequent init function calls.
        // if (_state) { throw new Error('Contract already initialized'); }
        preventDoubleInit(methodType),
        // Throw if NOT initialized on any non init function calls.
        // if (!_state) { throw new Error('Contract must be initialized'); }
        ensureInitBeforeCall(classId, methodType),
        // Create instance of contract by calling _create function.
        // let _contract = Contract._create();
        initializeContractClass(classId),
        // Reconstruct the contract with the state if the state is valid.
        // if (_state) { Contract._reconstruct(_contract, _state); }
        reconstructState(classId, methodType),
        // Collect the arguments sent to the function.
        // const _args = Contract._getArgs();
        collectArguments(classId),
        // Perform the actual function call to the appropriate contract method.
        // const _result = _contract.method(args);
        callContractMethod(methodName),
        // If the method called is either an initialize or call method type, save the changes to storage.
        // Contract._saveToStorage(_contract);
        saveToStorage(classId, methodType),
        // If a NearPromise is returned from the function call the onReturn method to execute the promise.
        // if (_result !== undefined)
        //   if (_result && _result.constructor && _result.constructor.name === 'NearPromise')
        //     _result.onReturn();
        //   else
        //     near.valueReturn(_contract._serialize(result));
        executePromise(classId),
    ])));
}
export default function () {
    return {
        visitor: {
            ClassDeclaration(path, { opts: { verbose } }) {
                // Capture the node of the current path.
                const classNode = path.node;
                // Check that the class is decorated with NearBindgen otherwise do nothing.
                if (classNode.decorators &&
                    "callee" in classNode.decorators[0].expression &&
                    "name" in classNode.decorators[0].expression.callee &&
                    classNode.decorators[0].expression.callee.name === "NearBindgen") {
                    // Iterate over the children of the class node.
                    classNode.body.body.forEach((child) => {
                        // Check that the child is a class method and has decorators.
                        if (child.type === "ClassMethod" &&
                            child.kind === "method" &&
                            child.decorators &&
                            "callee" in child.decorators[0].expression &&
                            "name" in child.decorators[0].expression.callee) {
                            // Capture the decorator name.
                            const methodType = child.decorators[0].expression.callee.name;
                            // Check that the decorator is one of the supported method types.
                            if (methodTypes.includes(methodType) && "name" in child.key) {
                                // Insert the method override into the class declaration.
                                path.insertAfter(createDeclaration(classNode.id, child.key.name, methodType));
                                if (verbose) {
                                    new Signale({
                                        scope: "near-bindgen-exporter",
                                    }).info(`Babel ${child.key.name} method export done.`);
                                }
                            }
                        }
                    });
                }
            },
        },
    };
}
