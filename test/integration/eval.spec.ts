import {
  builtInContext,
  EvaluatedValue,
  KugoError,
  parseKugoFile,
} from "../../src";
import { Maybe } from "../../src/utils/Maybe";

const NOT_FOUND = "Function main is not found";

const evalExp = (file: string) => {
  const evalCtx: Maybe<EvaluatedValue> = parseKugoFile(file).map(({ ast }) => {
    const buildCtx = builtInContext.extend(ast);

    return buildCtx.map(ctx => {
      const main = ctx.lookupFunction("main");
      if (main) {
        return Maybe.just(ctx.evalFunction(main));
      } else {
        return Maybe.fail(new KugoError(NOT_FOUND));
      }
    });
  });

  if (evalCtx.failed) {
    return evalCtx.errors.map(err => err.message).join("\n");
  } else if (evalCtx.value !== undefined) {
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

    expect(() => {
      expectEval("main = fail 0", "fail");
    }).toThrowError();
  });
});

describe("guards", () => {
  it("equal", () => {
    expectEval(`sign i\n  | i == 0 = 1\nmain = sign 0`, "1");
    expectEval(`sign i\n  | i == 1 = 1\n  | i == 0 = 2\nmain = sign 0`, "2");
  });

  it("less", () => {
    expectEval(`sign i\n  | i < 5 = 1\nmain = sign 2`, "1");
    expectEval(`sign i\n  | i < 5 = 1\n  | i < 10 = 2\nmain = sign 8`, "2");
  });

  it("more", () => {
    expectEval(
      `fac n\n  | n > 1 = prod n (fac (subst n 1))\n  | n == 1 = 1\nmain = fac 5`,
      "120",
    );
  });

  it("order", () => {
    expectEval(
      `fac n\n  | n  > 0 = prod (fac (subst n 1)) n\n  | n == 0 = 1\nmain = fac 5`,
      "120",
    );

    expectEval(
      `fac n\n  | n == 0 = 1\n  | n  > 0 = prod (fac (subst n 1)) n\nmain = fac 5`,
      "120",
    );
  });

  describe("recursion", () => {
    it("single branch", () => {
      // EXTRA: Remove abs
      // EXTRA: should work for inc 0
      expectEval(
        `inc i\n  | i == 10 = i\n  | i > 0 = inc (abs (sum i 1))\nmain = inc 1`,
        "10",
      );
    });

    it("multiple branches", () => {
      expectEval(
        `inc i\n  | i == 11 = 12\n  | i == 10 = i\n  | i > 0 = inc (abs (sum i 1))\nmain = inc 1`,
        "10",
      );
    });
  });
});

describe("functions", () => {
  it("args", () => {
    expectEval("const a b = a\nmain = const 1 3", "1");
  });

  it("tail recursion", () => {
    expectEval(
      `inc i\n  | i == 10000 = i\n  | i >      0 = inc (abs (sum i 1))\n\nmain = inc 1`,
      "10000",
    );
  });
});

describe("errors", () => {
  it("not resolving", () => {
    expectEval("\n", NOT_FOUND);
    expectEval("three = 3", NOT_FOUND);
    expectEval("three = two\nmain = three", "Function two is not found");
  });

  it("guards", () => {
    expectEval(
      `fac n\n  | i == 0 = 1\nmain = fac 0`,
      "Variable i is not found",
    );
  });

  it("recursive", () => {
    expectEval(
      `fac n\n  | n == 0 = fac 0\nmain = fac 0`,
      "Cannot build infinity type for fac",
    );

    expectEval(
      `fac n\n  | n == 0 = 0\n  | i == 1 = fac 2\nmain = fac 3`,
      "Variable i is not found",
    );
  });

  it("typecheck", () => {
    expectEval(
      "main = div 10 0",
      "div: expected 2 arg of type (-∞, -1] ∪ ℕ but got 0",
    );
    expectEval(
      `sign i\n  | i == 0 = 1\nmain = sign 1`,
      "sign: expected 1 arg of type 0 but got 1",
    );
    // TODO: expectEval(`sign i\n  | i < 5 = 1\n  | i < 10 = 2\nmain = sign 12`, "2");
    // TODO: sm i = sm (sum i 1)
  });
});
