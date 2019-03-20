import { IntegerNumberType } from "../../core/Type/Integral/IntegerNumberType";
import { MetaType } from "../../core/Type/Meta";
import { UnionMetaType } from "../../core/Type/Meta/UnionMetaType";
import { PExpression } from "./PExpression";
import { PExpressionVisitor } from "./Visitor/PExpressionVisitor";

export class NumberPExpression extends PExpression {
  public readonly type: MetaType;

  constructor(public readonly value: number) {
    super();

    this.type = new UnionMetaType([
      new IntegerNumberType({
        bottom: this.value,
        upper: this.value,
      }),
    ]);
  }

  public visit<T>(visitor: PExpressionVisitor<T>): T {
    return visitor.visitValue(this);
  }
}
