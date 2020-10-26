import { PluginObj, Visitor } from "@babel/core"
import { VisitNodeObject, Node, TraverseOptions } from "@babel/traverse"
import * as t from "@babel/types"

export interface BabelPlugin {
  (args: { types: typeof t }): PluginObj<Node>
}

export function babelPluginMerge(
  ...args: PluginObj<Node>[]
): { visitor: TraverseOptions<Node> } {
  const visitors: { [key: string]: Visitor[] } = {}
  const result: PluginObj<Node> = { visitor: {} }
  args.forEach(plugin => {
    for (const key in plugin) {
      switch (key) {
        case "visitor":
          for (const i in plugin.visitor) {
            let visitor: Visitor<Node>
            if (!result.visitor[i]) {
              if (plugin.visitor[i] instanceof Function) {
                // 如果是Function 需要转换成一般Object形式
                visitor = {
                  enter: path => {
                    plugin.visitor[i](path)
                  },
                }
              } else {
                visitor = plugin.visitor[i]
              }
              visitors[i] = []
              result.visitor[i] = {
                enter: path => {
                  visitors[i].forEach(p => (p.enter as any)?.(path))
                },
                exit: path => {
                  visitors[i].forEach(p => (p.exit as any)?.(path))
                },
              }
            }
            visitors[i].push(visitor)
          }
          break
        default:
          break
      }
    }
  })

  return result
}
