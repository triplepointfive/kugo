import { PExpression } from "./PExpression";

export abstract class PGuard {
  constructor(public readonly expression: PExpression) {}
}

// tslint:disable-next-line: max-classes-per-file
export class EmptyPGuard extends PGuard {}

// tslint:disable-next-line: max-classes-per-file
export class ConditionPGuard extends PGuard {
  constructor(expression: PExpression) {
    super(expression);
  }
}
