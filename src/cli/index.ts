import readline from "readline"

class KugoApp {
  public repl() {
    const rl = readline.createInterface(process.stdin, process.stdout)

    rl.setPrompt("> ")
    rl.prompt()

    rl.on("line", (input: string) => {
      if (input.length) {
        this.processInput(input)
      }

      rl.prompt()
    })
  }

  protected processInput(input: string): void {
    console.log(input)
  }
}

new KugoApp().repl()
