import fs from "fs";
import yargs from "yargs";

import { builtInContext } from "..";
import { parseKugoFile } from "../parser";

const clo = yargs
  .scriptName("runkugo")
  .usage("Usage: $0 file")
  .string("_");
const files = clo.argv._;

if (files.length === 1) {
  const file = fs.readFileSync(files[0]).toString();
  const parsedAst = parseKugoFile(file).ast;
  const ctx = builtInContext.extend(parsedAst);
  const main = ctx.lookupFunction("main");

  if (main) {
    ctx.global.forEach((fd, name) => {
      console.log(`${name} : `, fd.returnType.options[0].display());
    });
    console.log("Running");
    console.log(main.body.eval(ctx));
  } else {
    console.error("Function main is not found");
  }
} else {
  clo.showHelp();
}