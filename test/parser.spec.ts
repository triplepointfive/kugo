import { parseKugoFile } from "../src/parser";
import { IPApp } from "../src/parser/AST";
import { CallPExpression } from "../src/parser/AST/CallPExpression";
import { IPFunctionDeclaration } from "../src/parser/AST/IPFunctionDeclaration";
import { NumberPExpression } from "../src/parser/AST/NumberPExpression";
import { PExpression } from "../src/parser/AST/PExpression";

const app = (fun: IPFunctionDeclaration): IPApp => {
  return {
    functionDeclarations: [fun],
  };
};

const apps = (functionDeclarations: IPFunctionDeclaration[]): IPApp => {
  return {
    functionDeclarations,
  };
};

const f = (
  name: string,
  args: string[],
  expression: PExpression,
): IPFunctionDeclaration => {
  return new IPFunctionDeclaration(name, args, expression);
};

const call = (name: string, args: PExpression[] = []): PExpression => {
  return new CallPExpression(name, args);
};

const cons = (value: number): PExpression => {
  return new NumberPExpression(value);
};

const fst = f("fst", ["a", "b"], call("a", []));
const snd = f("snd", ["a", "b"], call("b", []));

describe("Parser", () => {
  it("Parsers source code into AST", () => {
    const cases: Array<[string, IPApp]> = [
      [
        "avg a b = div sum a b",
        app(
          f(
            "avg",
            ["a", "b"],
            call("div", [call("sum"), call("a"), call("b")]),
          ),
        ),
      ],
      [
        "avg a b = div (sum a b) 2",
        app(
          f(
            "avg",
            ["a", "b"],
            call("div", [call("sum", [call("a"), call("b")]), cons(2)]),
          ),
        ),
      ],
      ["three   =3", app(f("three", [], cons(3)))],
      ["fst a b = (a )", app(fst)],
      ["snd a b = b", app(snd)],
      [`\n  \nfst a b = a\n\nsnd a b = b\n  \n `, apps([fst, snd])],
    ];

    cases.forEach(([file, ast]) => {
      expect(parseKugoFile(file).ast).toEqual(ast);
    });
  });
});
