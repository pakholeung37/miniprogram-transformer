import { exec } from "shelljs"

async function run() {
  const { code } = exec(
    `yarn jscodeshift -t build/src/transforms/js/do-nothing.js tabs/ --extension=js`,
  )
}

run()
