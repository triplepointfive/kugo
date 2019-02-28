import { Body, Value } from "../../core/AST";
import { Context } from "../../core/Context";
import { IntegerNumberInterval } from "../../core/Type/Integral/IntegerNumberInterval";
import { IntegerNumberType } from "../../core/Type/Integral/IntegerNumberType";
import { MetaType } from "../../core/Type/Meta";
import { UnionMetaType } from "../../core/Type/Meta/UnionMetaType";
import { Maybe } from "../../utils/Maybe";
import { PExpression } from "./PExpression";

export class NumberPExpression extends PExpression {
  constructor(public readonly value: number) {
    super();
  }

  public build(): Body {
    return (ctx: Context): Maybe<Value> => {
      return Maybe.just(this.value);
    };
  }

  public type(): Maybe<MetaType> {
    return Maybe.just(
      new UnionMetaType([
        new IntegerNumberType([
          new IntegerNumberInterval({
            bottom: this.value,
            upper: this.value,
          }),
        ]),
      ]),
    );
  }

  public buildArgTypes(): void {
    return;
  }
}
