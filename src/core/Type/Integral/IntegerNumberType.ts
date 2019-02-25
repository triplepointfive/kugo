import { NumberType } from "../NumberType";
import { IntegerNumberInterval } from "./IntegerNumberInterval";

export class IntegerNumberType extends NumberType {
  constructor(public readonly bounds: IntegerNumberInterval[] = []) {
    super();
  }
  public merge({ bounds }: IntegerNumberType): IntegerNumberType {
    const resultSet: IntegerNumberInterval[] = [];
    this.bounds.forEach(interval1 => {
      bounds.forEach(interval2 => {
        const intersection = interval1.intersection(interval2);
        if (intersection) {
          resultSet.push(intersection);
        }
      });
    });
    // TODO: Add normalization
    return new IntegerNumberType(resultSet);
  }
  public display(): string {
    if (this.bounds.length === 0) {
      return "ℤ";
    }
    return this.bounds.map(b => b.display()).join(" ∪ ");
  }
}
