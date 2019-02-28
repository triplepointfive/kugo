import { IPApp } from "./AST";
import { KugoToAstVisitor } from "./AstVisitor";
import { KugoLexer } from "./Lexer";
import { KugoParser } from "./Parser";

// reuse the same parser instance.
const parser = new KugoParser();
const toAstVisitorInstance = new KugoToAstVisitor();

interface IParser {
  ast: IPApp;
  cst: any;
  lexErrors: any;
  parseErrors: any;
}

export function parseKugoFile(text: string): IParser {
  const lexResult = KugoLexer.tokenize(text);
  // setting a new input will RESET the parser instance's state.
  parser.input = lexResult.tokens;

  const cst = parser.app();

  // TODO: Build KugoErrors from lex or parse errors
  return {
    ast: toAstVisitorInstance.visit(cst),
    // This is a pure grammar, the value will be undefined until we add embedded actions
    // or enable automatic CST creation.
    cst,
    lexErrors: lexResult.errors,
    parseErrors: parser.errors,
  };
}
