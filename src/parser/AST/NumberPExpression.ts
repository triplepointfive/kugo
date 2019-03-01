import { IntegerNumberInterval } from "../../core/Type/Integral/IntegerNumberInterval";
import { IntegerNumberType } from "../../core/Type/Integral/IntegerNumberType";
import { MetaType } from "../../core/Type/Meta";
import { UnionMetaType } from "../../core/Type/Meta/UnionMetaType";
import { Maybe } from "../../utils/Maybe";
import { PExpression } from "./PExpression";
import { PExpressionVisitor } from "./Visitor/PExpressionVisitor";

export class NumberPExpression extends PExpression {
  private valueType: MetaType;

  constructor(public readonly value: number) {
    super();

    this.valueType = new UnionMetaType([
      new IntegerNumberType([
        new IntegerNumberInterval({
          bottom: this.value,
          upper: this.value,
        }),
      ]),
    ]);
  }

  public type(): Maybe<MetaType> {
    return Maybe.just(this.valueType);
  }

  public visit<T>(visitor: PExpressionVisitor<T>): T {
    return visitor.visitValue(this);
  }
}
