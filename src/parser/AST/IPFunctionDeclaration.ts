import { Arg } from "../../core/AST";
import { FunctionAnnotation } from "../../core/AST/FunctionAnnotation";
import { Context, FunctionsTable } from "../../core/Context";
import { AnyMetaType } from "../../core/Type/Meta/AnyMetaType";
import { PExpression } from "./PExpression";

export class PFunctionDeclaration {
  constructor(
    public readonly name: string,
    public readonly args: string[],
    public readonly expression: PExpression,
  ) {}

  public build(global: Context, module: FunctionsTable): void {
    const args = this.args.map(
      (name: string): Arg => [name, new AnyMetaType()],
    );

    // TODO: Pass FunctionAnnotation as last argument to allow self-type derivation
    this.expression.buildArgTypes(global, module, args);

    module.set(
      this.name,
      new FunctionAnnotation(args, this.expression.type(global, module), {
        eval: this.expression.build(),
      }),
    );
  }
}
