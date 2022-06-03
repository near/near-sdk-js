"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("@babel/types"));
function default_1() {
    return {
        visitor: {
            ClassDeclaration(path) {
                let classNode = path.node;
                if (classNode.decorators && classNode.decorators[0].expression.name == 'NearBindgen') {
                    let classId = classNode.id;
                    let contractMethods = {};
                    for (let child of classNode.body.body) {
                        if (child.type == 'ClassMethod' && child.kind == 'method' && child.decorators) {
                            if (child.decorators[0].expression.name == 'call') {
                                let callMethod = child.key.name;
                                contractMethods[callMethod] = 'call';
                            }
                            else if (child.decorators[0].expression.name == 'view') {
                                let viewMethod = child.key.name;
                                contractMethods[viewMethod] = 'view';
                            }
                        }
                    }
                    for (let method of Object.keys(contractMethods)) {
                        path.insertAfter(t.exportNamedDeclaration(t.functionDeclaration(t.identifier(method), [], t.blockStatement([
                            // let _contract = ContractClass._get()
                            t.variableDeclaration('let', [t.variableDeclarator(t.identifier('_contract'), t.callExpression(t.memberExpression(classId, t.identifier('_get')), []))]),
                            // _contract.deserialize()
                            t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('_contract'), t.identifier('deserialize')), [])),
                            // let args = _contract.constructor.deserializeArgs()
                            t.variableDeclaration('let', [t.variableDeclarator(t.identifier('args'), t.callExpression(t.memberExpression(t.memberExpression(t.identifier('_contract'), t.identifier('constructor')), t.identifier('deserializeArgs')), []))]),
                            // let ret = _contract.method(...args)
                            t.variableDeclaration('let', [t.variableDeclarator(t.identifier('ret'), t.callExpression(t.memberExpression(t.identifier('_contract'), t.identifier(method)), [t.spreadElement(t.identifier('args'))]))]),
                            contractMethods[method] == 'call' ?
                                // _contract.serialize()
                                t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('_contract'), t.identifier('serialize')), []))
                                : t.emptyStatement(),
                            // if (ret !== undefined)
                            t.ifStatement(t.binaryExpression('!==', t.identifier('ret'), t.identifier('undefined')), 
                            // env.jsvm_value_return(_contract.constructor.serializeReturn(ret))
                            t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('env'), t.identifier('jsvm_value_return')), [
                                t.callExpression(t.memberExpression(t.memberExpression(t.identifier('_contract'), t.identifier('constructor')), t.identifier('serializeReturn')), [t.identifier('ret')])
                            ])))
                        ])), [t.exportSpecifier(t.identifier(method), t.identifier(method))]));
                    }
                    path.insertAfter(t.exportNamedDeclaration(t.functionDeclaration(t.identifier('init'), [], t.blockStatement([
                        t.expressionStatement(t.newExpression(classId, [])),
                    ])), [t.exportSpecifier(t.identifier('init'), t.identifier('init'))]));
                    console.log('Near bindgen export done');
                }
            },
        },
    };
}
exports.default = default_1;
