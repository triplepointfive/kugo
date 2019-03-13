import { FunctionArgs } from "../../core/AST";
import { NumberPExpression } from "./NumberPExpression";
import { PExpression } from "./PExpression";

export class PGuard {
  constructor(
    public readonly predicate: PPredicate,
    public readonly expression: PExpression,
  ) {}
}

// tslint:disable-next-line: max-classes-per-file
export abstract class PPredicate {
  public abstract restrictArgs(args: FunctionArgs): FunctionArgs;
}

/**
 * Using this when guard gives no restrictions or even omitted.
 */
// tslint:disable-next-line: max-classes-per-file
export class ElsePPredicate extends PPredicate {
  public restrictArgs(args: FunctionArgs): FunctionArgs {
    return args;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class EqualPPredicate extends PPredicate {
  constructor(
    public readonly variable: string,
    public readonly value: NumberPExpression,
  ) {
    super();
  }

  public restrictArgs(args: FunctionArgs): FunctionArgs {
    return args.map(arg => {
      if (this.variable === arg.name) {
        // TODO: Fail when there is no type or remove returning maybe.
        this.value.type().with(type => (arg.type = arg.type.intersect(type)));
      }

      return arg;
    });
  }
}
