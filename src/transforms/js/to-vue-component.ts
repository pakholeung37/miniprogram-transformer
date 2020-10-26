import { Transform } from "jscodeshift"
import traverse from "@babel/traverse"
import wxToUni from "./plugins/wx-to-uni"
import { parse, print } from "../utils/parser"
import * as types from "@babel/types"
import { babelPluginMerge } from "../utils/babel-util"
const plugins = babelPluginMerge(...[wxToUni].map(p => p({ types })))
const transform: Transform = fileInfo => {
  const source = fileInfo.source
  const ast = parse(source)
  traverse(ast, plugins.visitor)
  const { code } = print(ast)
  return code
}

export default transform
