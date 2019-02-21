import { KugoParser } from "./Parser"
import { KugoLexer } from "./Lexer"
import { KugoToAstVisitor } from "./AstVisitor"
import { PApp } from "./AST"

// reuse the same parser instance.
const parser = new KugoParser()
const toAstVisitorInstance = new KugoToAstVisitor()

type IParser = {
  ast: PApp
  cst: any
  lexErrors: any
  parseErrors: any
}

export function parseKugoFile(text: string): IParser {
  const lexResult = KugoLexer.tokenize(text)
  // setting a new input will RESET the parser instance's state.
  parser.input = lexResult.tokens

  const cst = parser.app()

  return {
    // This is a pure grammar, the value will be undefined until we add embedded actions
    // or enable automatic CST creation.
    cst: cst,
    ast: toAstVisitorInstance.visit(cst),
    lexErrors: lexResult.errors,
    parseErrors: parser.errors
  }
}
