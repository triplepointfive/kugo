import { builtInContext, KugoError, parseKugoFile } from "../../src";
import { Maybe } from "../../src/utils/Maybe";

const evalExp = (file: string) => {
  const evalCtx = parseKugoFile(file).map(({ ast }) => {
    const buildCtx = builtInContext.extend(ast);

    return buildCtx.map(ctx => {
      const main = ctx.lookupFunction("main");
      if (main) {
        return ctx.evalFunction(main);
      } else {
        return Maybe.fail(new KugoError("Function main is not found"));
      }
    });
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

it("multiline", () => {
  expectEval("main\n  = -3", "-3");
  expectEval("\n\nmain\n  = 5\n\n", "5");
});

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

describe("guards", () => {
  it("equal", () => {
    expectEval(`sign i\n  | i == 0 = 1\nmain = sign 0`, "1");
    expectEval(`sign i\n  | i == 1 = 1\n  | i == 0 = 2\nmain = sign 0`, "2");
  });
});

describe("functions", () => {
  it("args", () => {
    expectEval("const a b = a\nmain = const 1 3", "1");
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

    // expectEval(`sign i\n  | i == 0 = 1\nmain = sign 1`, "1");
    // TODO: Same guard e.g. (== 1 & ==1)
  });
});
