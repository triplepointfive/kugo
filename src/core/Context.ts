import { IPApp } from "../parser/AST";
import { INExpression, Value } from "./AST";
import { FunctionAnnotation } from "./AST/FunctionAnnotation";

export type FunctionsTable = Map<string, FunctionAnnotation>;
export type ArgsTable = Map<string, Value>;

export class Context {
  constructor(
    public readonly global: FunctionsTable,
    public readonly local: ArgsTable,
  ) {}

  public extend(pApp: IPApp): Context {
    const ext: FunctionsTable = new Map();

    // TODO: Allow to use not yet defined function
    pApp.functionDeclarations.forEach(fd => {
      if (this.lookupFunction(fd.name)) {
        // TODO throw already defined
      }

      fd.build(this, ext);
    });

    return new Context(new Map([...this.global, ...ext]), this.local);
  }

  public nest(local: ArgsTable): Context {
    return new Context(this.global, local);
  }

  public evaluate(expression: INExpression): Value | Error[] {
    return expression.eval(this);
  }

  public lookupFunction(name: string): FunctionAnnotation | undefined {
    return this.global.get(name);
  }

  public lookupLocal(name: string): Value | undefined {
    return this.local.get(name);
  }
}
