import { exec, sort } from "shelljs"
import { readdirSync } from "graceful-fs"
import * as path from "path"

let jsTransforms = readdirSync(path.resolve(__dirname, "./transforms/js"))

// 定义需要按顺序运行的codemod ,这部分将会优先按顺序运行
const sortTransforms = [
  "cjs.js",
  "exports.js",
  "import-cleanup.js"
]
jsTransforms = sortTransforms.concat(jsTransforms.filter((t) => !(t in sortTransforms)))
async function run() {
  jsTransforms.forEach((file) => {
    // 只运行该目录下以.js结尾的文件
    if (/\.js$/.test(file)) {
      const { code } = exec(
        `yarn jscodeshift -t ${path.resolve(
          __dirname,
          "./transforms/js",
          file,
        )} tabs/ --extension=js`,
      )
    }
  })
}

run()
