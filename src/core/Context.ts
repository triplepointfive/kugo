import { concat, reduce } from "lodash";
import { PApp } from "../parser/AST";
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
import { KugoError } from "./KugoError";

export type FunctionsTable = Map<string, FunctionAnnotation>;
export type ArgsTable = Map<string, Value>;

export class Context {
  constructor(
    public readonly global: FunctionsTable,
    public readonly local: ArgsTable,
  ) {}

  public extend({ functionDeclarations }: PApp): Maybe<Context> {
    // Extra: Optimize to remove extra reallocation
    const ctx = new Context(new Map([...this.global]), this.local);

    for (const fd of functionDeclarations) {
      const builtFa: Maybe<FunctionAnnotation> = buildArgs(ctx, fd).map(
        args => {
          const retTypeVisitor = new ReturnTypePExpressionVisitor(ctx, args);

          const returnType = reduce(
            fd.guards.map(({ expression }) => expression.visit(retTypeVisitor)),
            (accReturnType, guardRetType) => {
              return guardRetType.map(type1 =>
                accReturnType.map(type2 => Maybe.just(type1.union(type2))),
              );
            },
          );

          if (returnType === undefined) {
            return Maybe.fail(
              new KugoError(`Function ${fd.name} has not guards`),
            );
          }

          return returnType.map(retType => {
            const guards: Maybe<NGuard[]> = reduce(
              fd.guards.map(guard => new BuildGuardVisitor(guard).build()),
              (accBodies: Maybe<NGuard[]>, body) =>
                body.map(bd =>
                  accBodies.map(bodies => Maybe.just(concat(bodies, [bd]))),
                ),
              Maybe.just([]),
            );

            return guards.map(gs =>
              Maybe.just(
                new AddedFunctionAnnotation(
                  args.map(({ name }) => name),
                  // TODO: Allow to have multiple options
                  [new FunctionType(args.map(({ type }) => type), retType)],
                  gs,
                ),
              ),
            );
          });
        },
      );

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
