import { NExpression } from ".";
import { Context } from "../Context";
import { FunctionType } from "./FunctionAnnotation";
import { NConstant } from "./NConstant";

// tslint:disable-next-line: max-classes-per-file
export class NGuard {
  constructor(
    public readonly predicate: NPredicate,
    public readonly body: NExpression,
    public readonly types: FunctionType[],
  ) {}

  public match(context: Context): boolean {
    return this.predicate.match(context);
  }
}

// tslint:disable-next-line: max-classes-per-file
export abstract class NPredicate {
  public abstract match(context: Context): boolean;
}

// tslint:disable-next-line: max-classes-per-file
export class ElseNPredicate extends NPredicate {
  public match(context: Context): boolean {
    return true;
  }
}

// tslint:disable-next-line: max-classes-per-file
abstract class VariableNPredicate extends NPredicate {
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

    return this.matchWithValue(val);
  }

  public abstract matchWithValue(value: number): boolean;
}

// tslint:disable-next-line: max-classes-per-file
export class EqualNPredicate extends VariableNPredicate {
  public matchWithValue(value: number): boolean {
    return value === this.value.value;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class LessNPredicate extends VariableNPredicate {
  public matchWithValue(value: number): boolean {
    return value < this.value.value;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class MoreNPredicate extends VariableNPredicate {
  public matchWithValue(value: number): boolean {
    return value > this.value.value;
  }
}
