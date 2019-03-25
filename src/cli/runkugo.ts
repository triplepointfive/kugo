import fs from "fs";
import yargs from "yargs";

import { KugoError } from "../core/KugoError";
import { builtInContext } from "../kugo";
import { parseKugoFile } from "../parser";
import { Maybe } from "../utils/Maybe";

const clo = yargs
  .scriptName("runkugo")
  .usage("Usage: $0 file")
  .string("_");
const files = clo.argv._;

if (files.length === 1) {
  const file = fs.readFileSync(files[0]).toString();
  const evalCtx = parseKugoFile(file).map(({ ast }) => {
    const buildCtx = builtInContext.extend(ast);
    return buildCtx.map(ctx => {
      const main = ctx.lookupFunction("main");
      if (main) {
        return Maybe.just(ctx.evalFunction(main));
      } else {
        return Maybe.fail(new KugoError("Function main is not found"));
      }
    });
  });

  evalCtx.with(
    value => console.log(value),
    errors => errors.forEach(({ message }) => console.log(message)),
  );
} else {
  clo.showHelp();
}
