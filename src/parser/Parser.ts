import { Parser } from "chevrotain"
import { allTokens, NewLine, Identity, Define } from "./Lexer"

export class KugoParser extends Parser {
  constructor() {
    super(allTokens)
    this.performSelfAnalysis()
  }

  public app = this.RULE("app", () => {
    this.MANY_SEP({
      SEP: NewLine,
      DEF: () => {
        this.SUBRULE(this.functionDeclaration)
      }
    })
  })

  private functionDeclaration = this.RULE("functionDeclaration", () => {
    this.CONSUME1(Identity)

    this.MANY({
      DEF: () => {
        this.CONSUME2(Identity)
      }
    })
    this.CONSUME(Define)
  })
}
