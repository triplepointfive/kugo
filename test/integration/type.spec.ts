import { builtInContext, KugoError, parseKugoFile } from "../../src";
import { Maybe } from "../../src/utils/Maybe";

const evalExp = (file: string, funcMain: string = "main") => {
  const parsedAst = parseKugoFile(file).ast;
  const buildCtx = builtInContext.extend(parsedAst);
  const evalCtx = buildCtx.map(ctx => {
    const func = ctx.lookupFunction(funcMain);
    if (func) {
      return Maybe.just(func.displayType());
    } else {
      return Maybe.fail(new KugoError(`Function ${func} is not found`));
    }
  });

  if (evalCtx.failed) {
    return evalCtx.errors.map(err => err.message).join("\n");
  } else {
    return evalCtx.value;
  }
};

const expectEval = (file: string, funcName: string, result: string): void => {
  expect(evalExp(file, funcName)).toEqual(result);
};

it("integer", () => {
  expectEval("main = -3", "main", "-3");
  expectEval("main a b = div a b", "main", "ℤ → (-∞, -1] ∪ [1, +∞) → ℤ");
  expectEval("main a b = prod (sum a b) b", "main", "ℤ → ℤ → ℤ");
});

it("any", () => {
  expectEval("fst a b = a", "fst", "a → b → a");
  expectEval("snd a b = b", "snd", "a → b → b");
});
