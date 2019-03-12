import { NumberPExpression } from "./NumberPExpression";
import { PExpression } from "./PExpression";

export abstract class PGuard {
  constructor(public readonly expression: PExpression) {}
}

// tslint:disable-next-line: max-classes-per-file
export class EmptyPGuard extends PGuard {}

// tslint:disable-next-line: max-classes-per-file
export class ConditionPGuard extends PGuard {
  constructor(public readonly predicate: PPredicate, expression: PExpression) {
    super(expression);
  }
}

// tslint:disable-next-line: max-classes-per-file
export abstract class PPredicate {}

// tslint:disable-next-line: max-classes-per-file
export class EqualPPredicate extends PPredicate {
  constructor(
    public readonly variable: string,
    public readonly value: NumberPExpression,
  ) {
    super();
  }
}
