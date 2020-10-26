import { BabelPlugin } from "../../utils/babel-util"

const plugin: BabelPlugin = ({ types: t }) => {
  return {
    visitor: {
      CallExpression(path) {
        if (
          (t.isIdentifier(path.node.callee) &&
            path.node.callee.name == "Component") ||
          (t.isIdentifier(path.node.callee) && path.node.callee.name == "Page")
        ) {
          path.parentPath.replaceWith(
            t.exportDefaultDeclaration(path.node.arguments[0] as any),
          )
        }
      },
    },
  }
}

export default plugin
