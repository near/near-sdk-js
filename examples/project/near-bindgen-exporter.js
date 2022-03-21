import * as t from "@babel/types";

export default function () {
  return {
    visitor: {
      ClassDeclaration(path) {
        let classNode = path.node
        if (classNode.decorators && classNode.decorators[0].expression.name == 'NearBindgen') {
          let classId = classNode.id
          let contractMethods = {}

          for(let child of classNode.body.body) {
            if (child.type == 'ClassMethod' && child.kind == 'method' && child.decorators) {
              if (child.decorators[0].expression.name == 'call') {
                let callMethod = child.key.name
                contractMethods[callMethod] = 'call'
              } else if (child.decorators[0].expression.name == 'view') {
                let viewMethod = child.key.name
                contractMethods[viewMethod] = 'view'
              }
            }
          }

          for (let method of Object.keys(contractMethods)) {
            path.insertAfter(
              t.exportNamedDeclaration(
                t.functionDeclaration(t.identifier(method), [], t.blockStatement([
                  t.variableDeclaration('let', [t.variableDeclarator(t.identifier('_contract'), 
                    t.callExpression(t.memberExpression(classId, t.identifier('_get')), []))]),
                  t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('_contract'), t.identifier(method)), [])),
                ])),
                [t.exportSpecifier(t.identifier(method), t.identifier(method))]))
          }

          path.insertAfter(
            t.exportNamedDeclaration(
              t.functionDeclaration(t.identifier('init'), [], t.blockStatement([
                t.expressionStatement(t.newExpression(classId, [])),
              ])),
              [t.exportSpecifier(t.identifier('init'), t.identifier('init'))]))

          console.log('nearbindgen done')
        }
      },
    },
  }
}
