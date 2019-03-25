import { concat, flatMap, reduce } from "lodash";
import { PApp } from "../parser/AST";
import { CallPExpression } from "../parser/AST/CallPExpression";
import { PFunctionDeclaration } from "../parser/AST/PFunctionDeclaration";
import { PGuard } from "../parser/AST/PGuard";
import { BuildGuardVisitor } from "../parser/AST/Visitor/BuildAstPExpressionVisitor";
import { buildArgs } from "../parser/AST/Visitor/FunctionArgsPExpressionVisitor";
import { ReturnTypePExpressionVisitor } from "../parser/AST/Visitor/ReturnTypePExpressionVisitor";
import { Maybe } from "../utils/Maybe";
import { evaluate, EvaluatedValue, Value } from "./AST";
import { AddedFunctionAnnotation } from "./AST/AddedFunctionAnnotation";
import { FunctionAnnotation, FunctionType } from "./AST/FunctionAnnotation";
import { NGuard } from "./AST/NGuard";
import { TypeCheckFunctionAnnotationVisitor } from "./AST/Visitor/TypeCheckFunctionAnnotationVisitor";
import { KugoError } from "./KugoError";
import { MetaType } from "./Type/Meta";

export type FunctionsTable = Map<string, FunctionAnnotation>;
export type ArgsTable = Map<string, Value>;
interface EvalValue {
  kind: "eval";
  value: EvaluatedValue;
}

function buildGuard(
  ctx: Context,
  fd: PFunctionDeclaration,
  guard: PGuard,
  recursiveResultType?: MetaType,
): Maybe<NGuard> {
  return buildArgs(ctx, fd, guard).map(typeArgs => {
    const types: FunctionType[] = [];
    let errors: KugoError[] = [];

    typeArgs.forEach(args => {
      if (recursiveResultType !== undefined) {
        types.push(
          new FunctionType(args.map(({ type }) => type), recursiveResultType),
        );
      } else {
        guard.expression
          .visit(new ReturnTypePExpressionVisitor(ctx, args))
          .with(
            resultType =>
              types.push(
                new FunctionType(args.map(({ type }) => type), resultType),
              ),
            argErrors => (errors = errors.concat(argErrors)),
          );
      }
    });

    if (errors.length) {
      return Maybe.fail(errors);
    }

    return new BuildGuardVisitor(guard, types).build();
  });
}

function checkIfRecursive(name: string, guard: PGuard): boolean {
  return (
    guard.expression instanceof CallPExpression &&
    guard.expression.name === name
  );
}

function buildGuards(ctx: Context, fd: PFunctionDeclaration): Maybe<NGuard[]> {
  const resultGuards: NGuard[] = [];
  // TODO: Preserve ordering of guards
  const recursiveGuards: PGuard[] = [];
  let resultErrors: KugoError[] = [];
  const addErrors = (errors: KugoError[]) =>
    (resultErrors = concat(resultErrors, errors));

  for (const guard of fd.guards) {
    if (checkIfRecursive(fd.name, guard)) {
      recursiveGuards.push(guard);
    } else {
      // TODO: Should be explicit
      // Assuming it failed because of recursion
      buildGuard(ctx, fd, guard).with(
        resultGuard => resultGuards.push(resultGuard),
        addErrors,
      );
    }
  }

  if (resultErrors.length) {
    return Maybe.fail(resultErrors);
  }

  if (recursiveGuards.length === 0) {
    return Maybe.just(resultGuards);
  }

  // TODO: Remove duplicity
  const resultType = reduce(
    flatMap(resultGuards, ({ types }) => types).map(({ result }) => result),
    (acc, result) => acc.union(result),
  );

  if (resultType === undefined) {
    return Maybe.fail(`Cannot build infinity type for ${fd.name}`);
  }

  for (const guard of recursiveGuards) {
    buildGuard(ctx, fd, guard, resultType).with(
      resultGuard => resultGuards.push(resultGuard),
      addErrors,
    );
  }

  if (resultErrors.length) {
    return Maybe.fail(resultErrors);
  }

  return Maybe.just(resultGuards);
}

function buildFA(
  ctx: Context,
  fd: PFunctionDeclaration,
): Maybe<FunctionAnnotation> {
  return buildGuards(ctx, fd).map(guards =>
    // EXTRA: Check functionTypes length
    Maybe.just(new AddedFunctionAnnotation(fd.args, guards)),
  );
}

export class Context {
  private localEvaluated: Map<string, EvalValue> = new Map();

  constructor(
    public readonly global: FunctionsTable,
    public readonly local: ArgsTable,
  ) {}

  public extend({ functionDeclarations }: PApp): Maybe<Context> {
    // Extra: Optimize to remove extra reallocation
    const ctx = new Context(new Map([...this.global]), this.local);

    for (const fd of functionDeclarations) {
      const builtFa = buildFA(ctx, fd);
      if (builtFa.failed) {
        return Maybe.fail(builtFa.errors);
      }

      builtFa.with(fa => ctx.global.set(fd.name, fa));
    }

    const typeCheck = TypeCheckFunctionAnnotationVisitor.check(ctx);

    if (typeCheck.failed) {
      return Maybe.fail(typeCheck.errors);
    }

    return Maybe.just(ctx);
  }

  public evalFunction(functionAnnotation: FunctionAnnotation): EvaluatedValue {
    return evaluate(this, {
      args: new Map(),
      fa: functionAnnotation,
      kind: "defer",
    });
  }

  public nest(local: ArgsTable): Context {
    return new Context(this.global, local);
  }

  public lookupFunction(name: string): FunctionAnnotation | undefined {
    return this.global.get(name);
  }

  public lookupLocal(name: string): Value | undefined {
    const localEval = this.localEvaluated.get(name);

    if (localEval !== undefined) {
      return localEval;
    }

    const localVariable = this.local.get(name);

    if (localVariable !== undefined) {
      const evalValue: EvalValue = {
        kind: "eval",
        value: evaluate(this, localVariable),
      };
      this.localEvaluated.set(name, evalValue);

      return evalValue;
    }
  }
}
