import fs from "fs";
import readline from "readline";

import { builtInFunctions } from "..";
import { Context } from "../core/Context";
import { parseKugoFile } from "../parser";

const ctx = new Context(builtInFunctions, new Map());

class KugoApp {
  public repl() {
    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.setPrompt("> ");
    rl.prompt();

    rl.on("line", (input: string) => {
      if (input.length) {
        this.processInput(input);
      }

      rl.prompt();
    });
  }

  public loadFile(filePath: string): void {
    this.info(`Loading ${filePath}`);
    const file = fs.readFileSync(filePath).toString();
    this.info(`Done`);
  }

  protected processInput(input: string): void {
    const file = `
sumArithmetic a n = prod n (div (sum a (prod a n)) 2)

lim n l = sumArithmetic n (div (subst l 1) n)

main = subst (sum (lim 3 1000) (lim 5 1000)) (lim 15 1000)
`;

    // ctx.evaluate(new NCall(input, [new NConstant(-3, [])]))
    // console.log(parseKugoFile(file).ast)
  }

  protected info(message: string): void {
    console.log(message);
  }
}

const app = new KugoApp();
app.repl();

const filePathInArgs = process.argv[2];
if (filePathInArgs) {
  app.loadFile(filePathInArgs);
}
