import { Expect, TestCase, TestFixture, FocusTest } from "alsatian"

import { parseKugoFile } from "../src/parser"
import { PApp, PFunctionDeclaration, PExpression } from "../src/parser/AST"

const app = (f: PFunctionDeclaration): PApp => {
  return {
    functionDeclarations: [f]
  }
}

const apps = (functionDeclarations: PFunctionDeclaration[]): PApp => {
  return {
    functionDeclarations
  }
}

const f = (
  name: string,
  args: string[],
  expression: PExpression
): PFunctionDeclaration => {
  return {
    name,
    args,
    expression
  }
}

const call = (name: string, args: PExpression[] = []): PExpression => {
  return {
    type: "call",
    name,
    args
  }
}

const cons = (value: number): PExpression => {
  return {
    type: "number",
    value
  }
}

const fst = f("fst", ["a", "b"], call("a", [])),
  snd = f("snd", ["a", "b"], call("b", []))

@TestFixture("Parsers source code into AST")
export class ParserFixture {
  @TestCase(
    "avg a b = div sum a b",
    app(f("avg", ["a", "b"], call("div", [call("sum"), call("a"), call("b")])))
  )
  @TestCase(
    "avg a b = div (sum a b) 2",
    app(
      f(
        "avg",
        ["a", "b"],
        call("div", [call("sum", [call("a"), call("b")]), cons(2)])
      )
    )
  )
  @TestCase("three   =3", app(f("three", [], cons(3))))
  @TestCase("fst a b = (a )", app(fst))
  @TestCase("snd a b = b", app(snd))
  @TestCase(`\n  \nfst a b = a\n\nsnd a b = b\n  \n `, apps([fst, snd]))
  public parseLine(file: string, ast: PApp) {
    Expect(parseKugoFile(file).ast).toEqual(ast)
  }
}
