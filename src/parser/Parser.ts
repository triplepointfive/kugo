import { Parser } from "chevrotain";
import {
  allTokens,
  CloseParentheses,
  Const,
  Define,
  Identity,
  Indent,
  OpenParentheses,
  Outdent,
} from "./Lexer";

export class KugoParser extends Parser {
  public app = this.RULE("app", () => {
    this.MANY2({
      DEF: () => this.SUBRULE(this.functionDeclaration),
    });
  });

  private functionDeclaration = this.RULE("functionDeclaration", () => {
    this.CONSUME1(Identity);

    this.MANY({
      DEF: () => this.CONSUME2(Identity),
    });

    this.OR([
      { ALT: () => this.SUBRULE(this.functionDeclarationBody) },
      {
        ALT: () => {
          this.CONSUME(Indent);
          this.SUBRULE1(this.functionDeclarationBody);
          this.CONSUME(Outdent);
        },
      },
    ]);
  });

  private functionDeclarationBody = this.RULE("functionDeclarationBody", () => {
    this.CONSUME(Define);
    this.SUBRULE(this.expression);
  });

  private expression = this.RULE("expression", () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(OpenParentheses);
          this.SUBRULE(this.expression);
          this.CONSUME(CloseParentheses);
        },
      },
      { ALT: () => this.SUBRULE(this.functionCall) },
      { ALT: () => this.CONSUME(Const) },
    ]);
  });

  private functionCall = this.RULE("functionCall", () => {
    this.CONSUME(Identity);
    this.MANY({
      DEF: () => this.SUBRULE(this.functionArg),
    });
  });

  private functionArg = this.RULE("functionArg", () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(OpenParentheses);
          this.SUBRULE(this.expression);
          this.CONSUME(CloseParentheses);
        },
      },
      { ALT: () => this.CONSUME(Identity) },
      { ALT: () => this.CONSUME(Const) },
    ]);
  });

  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }
}
