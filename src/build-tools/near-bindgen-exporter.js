import * as t from "@babel/types";
export default function () {
  return {
    visitor: {
      ClassDeclaration(path) {
        let classNode = path.node;
        if (classNode.decorators && classNode.decorators[0].expression.callee.name == 'NearBindgen') {
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
              else if (child.decorators[0].expression.name == 'initialize') {
                let initMethod = child.key.name;
                contractMethods[initMethod] = 'initialize';
              }
            }
          }
          for (let method of Object.keys(contractMethods)) {
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
                t.ifStatement(t.identifier('_state'), t.blockStatement([t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('Object'), t.identifier('assign')), [t.identifier('_contract'), t.identifier('_state')]))])) : t.emptyStatement(),
              // let _args = Counter._getArgs();
              t.variableDeclaration('let', [t.variableDeclarator(t.identifier('_args'), t.callExpression(t.memberExpression(classId, t.identifier('_getArgs')), []))]),
              // let _result = _contract.method(args);
              t.variableDeclaration('let', [t.variableDeclarator(t.identifier('_result'), t.callExpression(t.memberExpression(t.identifier('_contract'), t.identifier(method)), [t.identifier('_args')]))]),
              contractMethods[method] === 'initialize' || contractMethods[method] === 'call' ?
                // Counter._saveToStorage(_contract);
                t.expressionStatement(t.callExpression(t.memberExpression(classId, t.identifier('_saveToStorage')), [t.identifier('_contract')]))
                : t.emptyStatement(),
              // if (_result !== undefined) near.valueReturn(_contract._serialize(result));
              t.ifStatement(t.binaryExpression('!==', t.identifier('_result'), t.identifier('undefined')), t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('near'), t.identifier('valueReturn')), [t.callExpression(t.memberExpression(classId, t.identifier('_serialize')), [t.identifier('_result')])]))),
            ]))));
            console.log(`Babel ${method} method export done`);
          }
        }
      }
    }
  };
}
