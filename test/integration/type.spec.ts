import { builtInContext, KugoError, parseKugoFile } from "../../src";
import { Maybe } from "../../src/utils/Maybe";

const evalExp = (file: string, funcMain: string = "main") => {
  const evalCtx = parseKugoFile(file).map(({ ast }) => {
    const buildCtx = builtInContext.extend(ast);
    return buildCtx.map(ctx => {
      const func = ctx.lookupFunction(funcMain);
      if (func) {
        return Maybe.just(func.displayType());
      } else {
        return Maybe.fail(new KugoError(`Function ${func} is not found`));
      }
    });
  });

  if (evalCtx.failed) {
    return evalCtx.errors.map(err => err.message).join("\n");
  } else {
    return evalCtx.value;
  }
};

const expectEval = (
  file: string,
  result: string,
  funcName: string = "main",
): void => {
  expect(evalExp(file, funcName)).toEqual(result);
};

it("integer", () => {
  expectEval("main = -3", "-3");
  expectEval("main a b = div a b", "ℤ → (-∞, -1] → ℤ | ℤ → ℕ → ℤ");
  expectEval("main a b = prod (sum a b) b", "ℤ → ℤ → ℤ");
});

it("any", () => {
  expectEval("fst a b = a", "a → b → a", "fst");
  expectEval("snd a b = b", "a → b → b", "snd");
});

it("guard", () => {
  expectEval(`main i\n  | i == 0 = 1\n`, "0 → 1");
  expectEval(`main i\n  | i == 0 = 1\n  | i == 1 = 2\n`, "0 → 1 | 1 → 2");

  expectEval(`main i j\n  | i == 0 = 1\n`, "0 → a → 1");
  expectEval(`main j i\n  | i > 0 = 1\n`, "a → ℕ0 → 1");
});
