import { Arg } from "../../core/AST";
import { Context, FunctionsTable } from "../../core/Context";
import { PExpression } from "./PExpression";

export class IPFunctionDeclaration {
  constructor(
    public readonly name: string,
    public readonly args: string[],
    public readonly expression: PExpression,
  ) {}
  public build(global: Context, module: FunctionsTable): void {
    // TODO: Build and check types
    const args = this.args.map((name: string): Arg => [name, { options: [] }]);
    // TODO: Sadly, context required here to determine ret type
    module.set(this.name, {
      args,
      body: { eval: this.expression.build() },
      returnType: this.expression.type(global, module),
    });
  }
}
