import { Transform } from "jscodeshift"
import * as noVars from "./codeshift/no-vars"
import * as cjs from "./codeshift/cjs"
import * as exports_ from "./codeshift/exports"
import * as importCleanup from "./codeshift/import-cleanup"
import toVueComponent from "./plugins/resolve-component"

const transforms = [cjs, exports_, importCleanup, noVars, toVueComponent]
// try to run all transforms
const transform: Transform = (fileInfo, api, options) => {
  let source
  transforms.forEach(t => {
    source = t(fileInfo, api, options)
    if (source) {
      fileInfo.source = source
    }
  })
  return source
}

export default transform
