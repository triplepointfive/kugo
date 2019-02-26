import { IntegerNumberInterval, IntegerNumberType } from "../..";
import { BaseTypeVisitor } from "./BaseTypeVisitor";

export class MergeIntegralTypeVisitor extends BaseTypeVisitor<
  IntegerNumberType | undefined
> {
  private bounds: IntegerNumberInterval[];

  constructor({ bounds }: IntegerNumberType) {
    super();
    this.bounds = bounds;
  }

  // TODO: Add ability to return nothing
  public visitIntegral(type: IntegerNumberType): IntegerNumberType | undefined {
    const resultSet: IntegerNumberInterval[] = [];
    type.bounds.forEach(interval1 => {
      this.bounds.forEach(interval2 => {
        const intersection = interval1.intersection(interval2);
        if (intersection) {
          resultSet.push(intersection);
        }
      });
    });

    if (resultSet.length === 0) {
      return;
    }

    // TODO: Add normalization
    return new IntegerNumberType(resultSet);
  }
}
