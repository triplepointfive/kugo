import {
  CallPExpression,
  NumberPExpression,
  PApp,
  parseKugoFile,
  PExpression,
  PFunctionDeclaration,
} from "../src";

const app = (fun: PFunctionDeclaration): PApp => {
  return {
    functionDeclarations: [fun],
  };
};

const apps = (functionDeclarations: PFunctionDeclaration[]): PApp => {
  return {
    functionDeclarations,
  };
};

const f = (
  name: string,
  args: string[],
  expression: PExpression,
): PFunctionDeclaration => {
  return new PFunctionDeclaration(name, args, expression);
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
    const cases: Array<[string, PApp]> = [
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

    cases.forEach(([file, expectAst]) => {
      parseKugoFile(file).with(
        ({ ast }) => expect(ast).toEqual(expectAst),
        () => {
          throw new Error(`failed with ${expectAst}`);
        },
      );
    });
  });
});
