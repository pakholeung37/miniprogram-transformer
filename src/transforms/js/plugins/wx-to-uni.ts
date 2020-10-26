import { PluginObj } from "@babel/core"
import { Node } from "@babel/types"
import { BabelPlugin } from "../../utils/babel-util"

const plugin: BabelPlugin = () => {
  return {
    visitor: {
      Identifier(path) {
        if (path.node.name == "wx") {
          if (!path.scope.hasBinding("wx")) {
            path.node.name = "uni"
          }
        }
      },
    },
  }
}

export default plugin
