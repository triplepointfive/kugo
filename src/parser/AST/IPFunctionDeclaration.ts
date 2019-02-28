import { Arg } from "../../core/AST";
import { FunctionAnnotation } from "../../core/AST/FunctionAnnotation";
import { Context, FunctionsTable } from "../../core/Context";
import { KugoError } from "../../core/KugoError";
import { AnyMetaType } from "../../core/Type/Meta/AnyMetaType";
import { PExpression } from "./PExpression";

export class PFunctionDeclaration {
  constructor(
    public readonly name: string,
    public readonly args: string[],
    public readonly expression: PExpression,
  ) {}

  public build(
    global: Context,
    module: FunctionsTable,
  ): KugoError[] | undefined {
    const args = this.args.map(
      (name: string): Arg => [name, new AnyMetaType()],
    );

    // TODO: Pass FunctionAnnotation as last argument to allow self-type derivation
    this.expression.buildArgTypes(global, module, args);

    const type = this.expression.type(global, module);

    if (type instanceof Array) {
      return type;
    }

    module.set(
      this.name,
      new FunctionAnnotation(args, type, {
        eval: this.expression.build(),
      }),
    );
  }
}
