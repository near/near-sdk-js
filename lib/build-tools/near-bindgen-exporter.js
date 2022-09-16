import * as t from "@babel/types";
import { readFileSync } from 'fs';
import path from 'path';
export default function () {
    return {
        visitor: {
            ClassDeclaration(path) {
                const cFunctions = getCFunctions();
                let classNode = path.node;
                if (classNode.decorators && classNode.decorators[0].expression.callee.name == 'NearBindgen') {
                    let classId = classNode.id;
                    let contractMethods = {};
                    for (let child of classNode.body.body) {
                        if (child.type == 'ClassMethod' && child.kind == 'method' && child.decorators) {
                            if (child.decorators[0].expression.callee.name == 'call') {
                                let callMethod = child.key.name;
                                contractMethods[callMethod] = 'call';
                            }
                            else if (child.decorators[0].expression.callee.name == 'view') {
                                let viewMethod = child.key.name;
                                contractMethods[viewMethod] = 'view';
                            }
                            else if (child.decorators[0].expression.callee.name == 'initialize') {
                                let initMethod = child.key.name;
                                contractMethods[initMethod] = 'initialize';
                            }
                        }
                    }
                    for (let method of Object.keys(contractMethods)) {
                        validateMethod(method, cFunctions);
                        path.insertAfter(t.exportNamedDeclaration(t.functionDeclaration(t.identifier(method), [], t.blockStatement([
                            // const _state = Counter._getState();
                            t.variableDeclaration('let', [t.variableDeclarator(t.identifier('_state'), t.callExpression(t.memberExpression(classId, t.identifier('_getState')), []))]),
                            contractMethods[method] === 'initialize' ?
                                // if (_state) { throw new Error('Contract already initialized'); }
                                t.ifStatement(t.identifier('_state'), t.throwStatement(t.newExpression(t.identifier('Error'), [t.stringLiteral('Contract already initialized')])))
                                : t.emptyStatement(),
                            contractMethods[method] === 'call' || contractMethods[method] === 'view' ?
                                // if (!_state) { throw new Error('Contract must be initialized'); }
                                t.ifStatement(t.logicalExpression('&&', t.unaryExpression('!', t.identifier('_state')), t.callExpression(t.memberExpression(classId, t.identifier('_requireInit')), [])), t.blockStatement([t.throwStatement(t.newExpression(t.identifier('Error'), [t.stringLiteral('Contract must be initialized')]))]))
                                : t.emptyStatement(),
                            // let _contract = Counter._create();
                            t.variableDeclaration('let', [t.variableDeclarator(t.identifier('_contract'), t.callExpression(t.memberExpression(classId, t.identifier('_create')), []))]),
                            contractMethods[method] === 'call' || contractMethods[method] === 'view' ?
                                // if (_state) { Object.assign(_contract, state); }
                                t.ifStatement(t.identifier('_state'), t.blockStatement([t.expressionStatement(t.callExpression(t.memberExpression(classId, t.identifier('_reconstruct')), [t.identifier('_contract'), t.identifier('_state')]))])) : t.emptyStatement(),
                            // let _args = Counter._getArgs();
                            t.variableDeclaration('let', [t.variableDeclarator(t.identifier('_args'), t.callExpression(t.memberExpression(classId, t.identifier('_getArgs')), []))]),
                            // let _result = _contract.method(args);
                            t.variableDeclaration('let', [t.variableDeclarator(t.identifier('_result'), t.callExpression(t.memberExpression(t.identifier('_contract'), t.identifier(method)), [t.identifier('_args')]))]),
                            contractMethods[method] === 'initialize' || contractMethods[method] === 'call' ?
                                // Counter._saveToStorage(_contract);
                                t.expressionStatement(t.callExpression(t.memberExpression(classId, t.identifier('_saveToStorage')), [t.identifier('_contract')]))
                                : t.emptyStatement(),
                            // if (_result !== undefined) 
                            //   if (_result && _result.constructor && _result.constructor.name === 'NearPromise')
                            //     _result.onReturn();
                            //   else
                            //     near.valueReturn(_contract._serialize(result));
                            t.ifStatement(t.binaryExpression('!==', t.identifier('_result'), t.identifier('undefined')), t.ifStatement(t.logicalExpression('&&', t.logicalExpression('&&', t.identifier('_result'), t.memberExpression(t.identifier('_result'), t.identifier('constructor'))), t.binaryExpression('===', t.memberExpression(t.memberExpression(t.identifier('_result'), t.identifier('constructor')), t.identifier('name')), t.stringLiteral('NearPromise'))), t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('_result'), t.identifier('onReturn')), [])), t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('env'), t.identifier('value_return')), [t.callExpression(t.memberExpression(classId, t.identifier('_serialize')), [t.identifier('_result')])]))))
                        ]))));
                        console.log(`Babel ${method} method export done`);
                    }
                }
            }
        }
    };
}
function transformCBuilderToMatrix(builderRaw) {
    let lines = builderRaw.split('\n');
    lines = lines.map((line) => [...line]);
    return lines;
}
// receive cords in file
function collectCFunction(x, y, cMatrix) {
    let cFunc = [];
    let line = cMatrix[x];
    let i = y - 1;
    let newY = 0;
    while (i > -1) {
        if (line[i] != " " && line[i] != "(" && line[i] != "*") {
            cFunc.push(line[i]);
            i = i - 1;
        }
        else {
            newY = i + 1;
            i = -1;
        }
    }
    return cFunc.length > 0 ? { name: cFunc.reverse().join(''), cords: { x, y: newY } } : null;
}
function collectCFunctions(cMatrix) {
    let cFunctions = [];
    for (let i = 0; i < cMatrix.length; i++) {
        for (let j = 0; j < cMatrix[i].length; j++) {
            if (cMatrix[i][j] === "(") {
                const cFunc = collectCFunction(i, j, cMatrix);
                cFunctions.push(cFunc);
            }
        }
    }
    return cFunctions.filter((cFunc) => cFunc != null);
}
function groupCFunctions(cFunctions) {
    let newCFunctions = new Map();
    cFunctions.forEach(fun => {
        let existFun = newCFunctions.get(fun.name);
        if (existFun) {
            newCFunctions.set(fun.name, [...existFun, fun.cords]);
        }
        else {
            newCFunctions.set(fun.name, [fun.cords]);
        }
    });
    return newCFunctions;
}
function getCFunctions() {
    const builderRaw = readFileSync(path.resolve('../cli/builder/builder.c'), 'utf-8');
    let cMatrix = transformCBuilderToMatrix(builderRaw);
    const cFunctions = groupCFunctions(collectCFunctions(cMatrix));
    console.log(cFunctions);
    // TODO get cords from regex match 
    // const regex = new RegExp(/(?<=JS_SetPropertyStr\(ctx, env, ").+?(?=", JS_NewCFunction\(ctx,)/gm)
    // const cFunctions = builderRaw.match(regex)
    // return cFunctions
    return cFunctions;
}
function validateMethod(method, cFunctions) {
    const includeMethod = cFunctions.get(method);
    if (includeMethod) {
        throw new Error(`Method ${method} is reserved by Near SDK, use another naming`);
    }
}
