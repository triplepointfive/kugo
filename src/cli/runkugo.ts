import fs from "fs";
import yargs from "yargs";

import { builtInContext } from "../kugo";
import { parseKugoFile } from "../parser";

const clo = yargs
  .scriptName("runkugo")
  .usage("Usage: $0 file")
  .string("_");
const files = clo.argv._;

if (files.length === 1) {
  const file = fs.readFileSync(files[0]).toString();
  const parsedAst = parseKugoFile(file).ast;
  const buildCtx = builtInContext.extend(parsedAst);

  if (buildCtx.failed) {
    buildCtx.errors.forEach(({ message }) => console.log(message));
  }

  buildCtx.with(ctx => {
    const main = ctx.lookupFunction("main");
    if (main) {
      ctx.global.forEach((fd, name) => {
        console.log(`${name} : ${fd.displayType()}`);
      });
      console.log("Main: ", ctx.evalFunction(main));
    } else {
      console.error("Function main is not found");
    }
  });
} else {
  clo.showHelp();
}
