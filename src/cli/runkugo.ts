import fs from "fs"
import yargs from "yargs"

import { builtInContext } from ".."
import { buildAst } from "../core/AST"
import { parseKugoFile } from "../parser"

const clo = yargs
    .scriptName("runkugo")
    .usage("Usage: $0 file")
    .string("_"),
  files = clo.argv._

if (files.length === 1) {
  const file = fs.readFileSync(files[0]).toString(),
    parsedAst = parseKugoFile(file).ast,
    ctx = buildAst(builtInContext, parsedAst)

  console.log("rest: ", ctx)
} else {
  clo.showHelp()
}
