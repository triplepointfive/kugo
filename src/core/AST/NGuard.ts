import { NExpression } from ".";
import { Context } from "../Context";
import { NConstant } from "./NConstant";

export abstract class NGuard {
  constructor(public readonly body: NExpression) {}

  public abstract match(context: Context): boolean;
}

// tslint:disable-next-line: max-classes-per-file
export class EmptyNGuard extends NGuard {
  public match(context: Context): boolean {
    return true;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class ConditionNGuard extends NGuard {
  constructor(public readonly predicate: NPredicate, expression: NExpression) {
    super(expression);
  }

  public match(context: Context): boolean {
    return this.predicate.match(context);
  }
}

// tslint:disable-next-line: max-classes-per-file
export abstract class NPredicate {
  public abstract match(context: Context): boolean;
}

// tslint:disable-next-line: max-classes-per-file
export class EqualNPredicate extends NPredicate {
  constructor(
    public readonly variable: string,
    public readonly value: NConstant,
  ) {
    super();
  }

  public match(context: Context): boolean {
    const val = context.lookupLocal(this.variable);

    if (val === undefined) {
      // TODO: throw error
      return false;
    }

    return val === this.value.value;
  }
}
