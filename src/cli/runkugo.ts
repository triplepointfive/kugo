import fs from "fs";
import yargs from "yargs";

import { builtInContext } from "..";
import { buildAst } from "../core/AST";
import { parseKugoFile } from "../parser";

const clo = yargs
  .scriptName("runkugo")
  .usage("Usage: $0 file")
  .string("_");
const files = clo.argv._;

if (files.length === 1) {
  const file = fs.readFileSync(files[0]).toString();
  const parsedAst = parseKugoFile(file).ast;
  const ctx = buildAst(builtInContext, parsedAst);
  const main = ctx.lookupFunction("main");

  if (main) {
    console.log(main.body.eval(ctx));
  } else {
    console.error("Function main is not found");
  }
} else {
  clo.showHelp();
}
