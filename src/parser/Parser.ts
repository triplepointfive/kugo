import { Parser } from "chevrotain";
import {
  allTokens,
  CloseParentheses,
  Const,
  Define,
  Identity,
  Indent,
  NewLine,
  OpenParentheses,
  Operator,
  Outdent,
  VerticalBar,
} from "./Lexer";

export class KugoParser extends Parser {
  public app = this.RULE("app", () => {
    this.MANY_SEP({
      SEP: NewLine,
      // tslint:disable-next-line: object-literal-sort-keys
      DEF: () => this.SUBRULE(this.functionDeclaration),
    });
  });

  private functionDeclaration = this.RULE("functionDeclaration", () => {
    this.CONSUME1(Identity);

    this.MANY({
      DEF: () => this.CONSUME2(Identity),
    });

    this.OR([
      {
        ALT: () => {
          this.CONSUME1(Indent);
          this.AT_LEAST_ONE(() => {
            this.SUBRULE2(this.guardClause);
          });
          this.CONSUME1(Outdent);
        },
      },
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

  private guardClause = this.RULE("guardClause", () => {
    this.CONSUME(VerticalBar);
    this.CONSUME(Identity);
    this.CONSUME(Operator);
    this.CONSUME(Const);
    this.SUBRULE(this.functionDeclarationBody);
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
