import { concat, reduce } from "lodash";
import { PApp } from "../parser/AST";
import { PFunctionDeclaration } from "../parser/AST/PFunctionDeclaration";
import { BuildGuardVisitor } from "../parser/AST/Visitor/BuildAstPExpressionVisitor";
import { buildArgs } from "../parser/AST/Visitor/FunctionArgsPExpressionVisitor";
import { ReturnTypePExpressionVisitor } from "../parser/AST/Visitor/ReturnTypePExpressionVisitor";
import { Maybe } from "../utils/Maybe";
import { Value } from "./AST";
import { AddedFunctionAnnotation } from "./AST/AddedFunctionAnnotation";
import { FunctionAnnotation, FunctionType } from "./AST/FunctionAnnotation";
import { NGuard } from "./AST/NGuard";
import { EvalFunctionAnnotationVisitor } from "./AST/Visitor/EvalFunctionAnnotationVisitor";
import { TypeCheckFunctionAnnotationVisitor } from "./AST/Visitor/TypeCheckFunctionAnnotationVisitor";

export type FunctionsTable = Map<string, FunctionAnnotation>;
export type ArgsTable = Map<string, Value>;

function buildFA(
  ctx: Context,
  fd: PFunctionDeclaration,
): Maybe<FunctionAnnotation> {
  return reduce(
    fd.guards.map(
      (guard): Maybe<FunctionType> =>
        buildArgs(ctx, fd, guard).map(args =>
          guard.expression
            .visit(new ReturnTypePExpressionVisitor(ctx, args))
            .map(resultType =>
              Maybe.just(
                new FunctionType(args.map(({ type }) => type), resultType),
              ),
            ),
        ),
    ),
    (accFunctionTypes: Maybe<FunctionType[]>, functionType) =>
      functionType.map(ft =>
        accFunctionTypes.map(fts => Maybe.just(concat(fts, [ft]))),
      ),
    Maybe.just([]),
  ).map(functionTypes =>
    // EXTRA: Check functionTypes length
    reduce(
      fd.guards.map(guard => new BuildGuardVisitor(guard).build()),
      (accBodies: Maybe<NGuard[]>, body) =>
        body.map(bd =>
          accBodies.map(bodies => Maybe.just(concat(bodies, [bd]))),
        ),
      Maybe.just([]),
    ).map(bodies =>
      Maybe.just(new AddedFunctionAnnotation(fd.args, functionTypes, bodies)),
    ),
  );
}

export class Context {
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

  public evalFunction(functionAnnotation: FunctionAnnotation): Maybe<Value> {
    return functionAnnotation.visit(new EvalFunctionAnnotationVisitor(this));
  }

  public nest(local: ArgsTable): Context {
    return new Context(this.global, local);
  }

  public lookupFunction(name: string): FunctionAnnotation | undefined {
    return this.global.get(name);
  }

  public lookupLocal(name: string): Value | undefined {
    return this.local.get(name);
  }
}
