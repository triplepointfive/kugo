import { IRecognitionException } from "chevrotain";
import { KugoError } from "../core/KugoError";
import { Maybe } from "../utils/Maybe";
import { PApp } from "./AST";
import { KugoToAstVisitor } from "./CstVisitor";
import { tokenize } from "./Lexer";
import { KugoParser } from "./Parser";

// reuse the same parser instance.
const parser = new KugoParser();
const toAstVisitorInstance = new KugoToAstVisitor();

interface ParseResult {
  ast: PApp;
  cst: any;
}

export function parseKugoFile(text: string): Maybe<ParseResult> {
  // setting a new input will RESET the parser instance's state.
  return tokenize(text).map(({ tokens }) => {
    parser.input = tokens;

    const cst = parser.app();

    if (parser.errors.length) {
      return Maybe.fail(
        parser.errors.map(
          ({ message }: IRecognitionException) => new KugoError(message),
        ),
      );
    }

    return Maybe.just({
      ast: toAstVisitorInstance.visit(cst),
      // This is a pure grammar, the value will be undefined until we add embedded actions
      // or enable automatic CST creation.
      cst,
    });
  });
}
