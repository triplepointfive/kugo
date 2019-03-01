import { PApp } from "../parser/AST";
import { BuildAstPExpressionVisitor } from "../parser/AST/Visitor/BuildAstPExpressionVisitor";
import { FunctionArgsPExpressionVisitor } from "../parser/AST/Visitor/FunctionArgsPExpressionVisitor";
import { ReturnTypePExpressionVisitor } from "../parser/AST/Visitor/ReturnTypePExpressionVisitor";
import { Maybe } from "../utils/Maybe";
import { NExpression, Value } from "./AST";
import { AddedFunctionAnnotation } from "./AST/AddedFunctionAnnotation";
import { FunctionAnnotation } from "./AST/FunctionAnnotation";
import { EvalAstVisitor } from "./AST/Visitor/EvalAstVisitor";
import { EvalFunctionAnnotationVisitor } from "./AST/Visitor/EvalFunctionAnnotationVisitor";

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
      const builtFa = FunctionArgsPExpressionVisitor.build(ctx, fd).map(
        args => {
          return fd.expression
            .visit(new ReturnTypePExpressionVisitor(ctx, args))
            .map(returnType => {
              return fd.expression
                .visit(new BuildAstPExpressionVisitor())
                .map(body => {
                  return Maybe.just(
                    new AddedFunctionAnnotation(args, returnType, body),
                  );
                });
            });
        },
      );

      if (builtFa.failed) {
        return Maybe.fail(builtFa.errors);
      }

      builtFa.with(fa => ctx.global.set(fd.name, fa));
    }

    return Maybe.just(ctx);
  }

  public evalExp(expression: NExpression): Maybe<Value> {
    return expression.visit(new EvalAstVisitor(this));
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
