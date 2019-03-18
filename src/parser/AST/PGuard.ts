import { IntegerNumberInterval, IntegerNumberType, UnionMetaType } from "../..";
import { FunctionArgs } from "../../core/AST";
import { MetaType } from "../../core/Type/Meta";
import { Maybe } from "../../utils/Maybe";
import { NumberPExpression } from "./NumberPExpression";
import { PExpression } from "./PExpression";

export class PGuard {
  constructor(
    public readonly predicate: PPredicate,
    public readonly expression: PExpression,
  ) {}
}

// tslint:disable-next-line: max-classes-per-file
export abstract class PPredicateVisitor<T> {
  public abstract visitElse(predicate: ElsePPredicate): T;
  public abstract visitEqual(predicate: EqualPPredicate): T;
  public abstract visitLess(predicate: LessPPredicate): T;
  public abstract visitMore(predicate: MorePPredicate): T;
}

// tslint:disable-next-line: max-classes-per-file
export abstract class PPredicate {
  public abstract restrictArgs(args: FunctionArgs): Maybe<FunctionArgs>;
  public abstract visit<T>(visitor: PPredicateVisitor<T>): T;
}

/**
 * Using this when guard gives no restrictions or even omitted.
 */
// tslint:disable-next-line: max-classes-per-file
export class ElsePPredicate extends PPredicate {
  public restrictArgs(args: FunctionArgs): Maybe<FunctionArgs> {
    return Maybe.just(args);
  }

  public visit<T>(visitor: PPredicateVisitor<T>): T {
    return visitor.visitElse(this);
  }
}

// tslint:disable-next-line: max-classes-per-file
abstract class VariableConditionPPredicate extends PPredicate {
  constructor(
    public readonly variable: string,
    public readonly value: NumberPExpression,
  ) {
    super();
  }

  public restrictArgs(args: FunctionArgs): Maybe<FunctionArgs> {
    let found = false;
    const restrictedArgs = args.map(({ name, type }) => {
      if (this.variable === name) {
        found = true;
        return { name, type: type.intersect(this.subtype) };
      }

      return { name, type };
    });

    if (found) {
      return Maybe.just(restrictedArgs);
    }

    return Maybe.fail(`Variable ${this.variable} is not found`);
  }

  abstract get subtype(): MetaType;
}

// tslint:disable-next-line: max-classes-per-file
export class EqualPPredicate extends VariableConditionPPredicate {
  get subtype(): MetaType {
    return this.value.type;
  }

  public visit<T>(visitor: PPredicateVisitor<T>): T {
    return visitor.visitEqual(this);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class LessPPredicate extends VariableConditionPPredicate {
  get subtype(): MetaType {
    return new UnionMetaType([
      new IntegerNumberType([
        new IntegerNumberInterval({
          upper: this.value.value,
        }),
      ]),
    ]);
  }

  public visit<T>(visitor: PPredicateVisitor<T>): T {
    return visitor.visitLess(this);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class MorePPredicate extends VariableConditionPPredicate {
  get subtype(): MetaType {
    return new UnionMetaType([
      new IntegerNumberType([
        new IntegerNumberInterval({
          bottom: this.value.value,
        }),
      ]),
    ]);
  }

  public visit<T>(visitor: PPredicateVisitor<T>): T {
    return visitor.visitMore(this);
  }
}
