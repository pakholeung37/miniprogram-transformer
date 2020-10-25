import { Transform } from "jscodeshift"
import { parse, print } from "../utils/parser"
import traverse, { NodePath } from "@babel/traverse"
import * as t from "@babel/types"

const transform: Transform = (fileInfo, api) => {
  const j = api.jscodeshift
  const source = fileInfo.source
  const ast = parse(source)

  traverse(ast, {
    CallExpression(path) {
      if (
        (path.node.callee as t.Identifier).name == "Component" ||
        (path.node.callee as t.Identifier).name == "Page"
      ) {
        path.replaceWith(t.exportDefaultDeclaration(path.node.arguments[0]))
      }
    },
  })
  const { code } = print(ast)
  return code
}

export default transform
