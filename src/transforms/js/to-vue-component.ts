import { Transform } from "jscodeshift"
import { transform } from "@babel/core"
import wxToUni from "./plugins/wx-to-uni"
import resolveComponent from "./plugins/resolve-component"

const t: Transform = fileInfo => {
  const source = fileInfo.source
  const { code } = transform(source, {
    plugins: [wxToUni, resolveComponent]
  })
  return code
}

export default t
