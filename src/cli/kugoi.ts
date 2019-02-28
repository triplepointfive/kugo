import readline from "readline";

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
    return;
  }

  protected processInput(input: string): void {
    return;
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
