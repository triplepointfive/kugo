import Vorpal = require("vorpal")
import { Args, CommandInstance } from "vorpal"

const vorpal = new Vorpal()

vorpal
  .command("query", "Queries the server")
  .action(async function(this: CommandInstance, args: Args) {
    this.log("query")
  })

vorpal.delimiter("kugo> ").show()
