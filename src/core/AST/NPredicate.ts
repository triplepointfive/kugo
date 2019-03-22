import { Context } from "../Context";
import { NConstant } from "./NConstant";

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

    return this.matchWithValue(val.value);
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
