import { builtInContext, KugoError, parseKugoFile } from "../src";
import { Maybe } from "../src/utils/Maybe";

const evalExp = (file: string) => {
  const parsedAst = parseKugoFile(file).ast;
  const buildCtx = builtInContext.extend(parsedAst);
  const evalCtx = buildCtx.map(ctx => {
    const main = ctx.lookupFunction("main");
    if (main) {
      return ctx.evalFunction(main);
    } else {
      return Maybe.fail(new KugoError("Function main is not found"));
    }
  });

  if (evalCtx.failed) {
    return evalCtx.errors.map(err => err.message).join("\n");
  } else {
    return `${evalCtx.value}`;
  }
};

const expectEval = (file: string, result: string): void => {
  expect(evalExp(file)).toEqual(result);
};

// TODO: Check for lex errors
// TODO: Type fails
// TODO: Syntax fails

describe("raw values", () => {
  it("integer", () => {
    expectEval("main = -3", "-3");
    expectEval("main = 5", "5");
    expectEval("main = (0)", "0");
  });
});

describe("built in", () => {
  it("math", () => {
    expectEval("main = abs (-3)", "3");
    expectEval("main = div 10 2", "5");
    expectEval("main = sum 10 2", "12");
    expectEval("main = subst 10 2", "8");
    expectEval("main = prod 10 2", "20");
  });
});

describe("errors", () => {
  it("not resolving", () => {
    expectEval("three = 3", "Function main is not found");
    expectEval("three = two\nmain = three", "Function two is not found");
  });

  it("typecheck", () => {
    expectEval(
      "main = div 10 0",
      "div: expected 1 arg of type (-∞, -1] ∪ [1, +∞) but got 0",
    );
  });
});
