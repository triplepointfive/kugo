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
    ctx = buildAst(builtInContext, parsedAst),
    main = ctx.lookupFunction("main")

  if (main) {
    const resp = main.body.eval(ctx)
    console.log(resp)
  } else {
    console.error("Function main is not found")
  }
} else {
  clo.showHelp()
}
