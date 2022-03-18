import * as t from "@babel/types";

export default function () {
  return {
    visitor: {
      ClassDeclaration(path) {
        let classNode = path.node
        if (classNode.decorators && classNode.decorators[0].expression.name == 'NearBindgen') {
            let contractMethods = {}

            console.log(classNode.body.body)
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

            console.log(contractMethods)
            console.log(path.parentPath)
            path.insertAfter(
              t.exportNamedDeclaration(t.variableDeclaration('let', [t.variableDeclarator(t.identifier('aaaaa'), t.stringLiteral("A little high, little low."))]), [t.exportSpecifier(t.identifier('aaaaa'), t.identifier('aaaaa'))])
            )
            console.log('666')
        } else {
          // path.replaceWithMultiple([
          //   t.variableDeclaration('let', [t.variableDeclarator(t.identifier('bbbbb'), t.stringLiteral("A little high, little low."))])
          // ])
        }
      },
    },
  }
}
