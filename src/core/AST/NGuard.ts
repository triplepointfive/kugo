import { NExpression } from ".";

export abstract class NGuard {
  constructor(public readonly body: NExpression) {}
}

// tslint:disable-next-line: max-classes-per-file
export class EmptyNGuard extends NGuard {}

// tslint:disable-next-line: max-classes-per-file
export class ConditionNGuard extends NGuard {
  constructor(expression: NExpression) {
    super(expression);
  }
}
