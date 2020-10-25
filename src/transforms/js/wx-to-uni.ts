import { Transform } from "jscodeshift"
import { parse, print } from "../utils/parser"
import traverse from "@babel/traverse"

const transform: Transform = fileInfo => {
  const source = fileInfo.source
  const ast = parse(source)
  traverse(ast, {
    Identifier(path) {
      if (path.node.name == "wx") {
        if (!path.scope.hasBinding("wx")) {
          path.node.name = "uni"
        }
      }
    },
  })
  const { code } = print(ast)
  return code
}

export default transform
