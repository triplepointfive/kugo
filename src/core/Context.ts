import { PApp } from "../parser/AST";
import { FunctionArgsPExpressionVisitor } from "../parser/AST/FunctionArgsPExpressionVisitor";
import { ReturnTypePExpressionVisitor } from "../parser/AST/ReturnTypePExpressionVisitor";
import { Maybe } from "../utils/Maybe";
import { NExpression, Value } from "./AST";
import { FunctionAnnotation } from "./AST/FunctionAnnotation";

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
            .visit(new ReturnTypePExpressionVisitor(ctx))
            .map(returnType => {
              return Maybe.just(
                new FunctionAnnotation(args, returnType, {
                  eval: fd.expression.build(),
                }),
              );
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

  public nest(local: ArgsTable): Context {
    return new Context(this.global, local);
  }

  public evaluate(expression: NExpression): Maybe<Value> {
    return expression.eval(this);
  }

  public lookupFunction(name: string): FunctionAnnotation | undefined {
    return this.global.get(name);
  }

  public lookupLocal(name: string): Value | undefined {
    return this.local.get(name);
  }
}
