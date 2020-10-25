import { parse as babelParse, ParserOptions } from "@babel/parser"
import generate from "@babel/generator"
import * as merge from "merge"

const defaultParseOptions: ParserOptions = {
  sourceType: "module",
}
export const parse: typeof babelParse = (ast, options = undefined) => {
  const opt = merge(defaultParseOptions, options)
  return babelParse(ast, opt)
}
const defaultGeneratorOptions = {}
export const print: typeof generate = (
  ast,
  options = undefined,
  code = undefined,
) => {
  const opt = merge(defaultGeneratorOptions, options)
  return generate(ast, opt, code)
}
