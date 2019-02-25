import { Body, Value } from "../../core/AST";
import { Context } from "../../core/Context";
import { IntegerNumberInterval } from "../../core/Type/Integral/IntegerNumberInterval";
import { IntegerNumberType } from "../../core/Type/Integral/IntegerNumberType";
import { IMetaType } from "../../core/Type/Meta";
import { PExpression } from "./PExpression";

export class NumberPExpression extends PExpression {
  constructor(public readonly value: number) {
    super();
  }
  public build(): Body {
    return (ctx: Context): Value | Error[] => {
      return this.value;
    };
  }
  public type(): IMetaType {
    return {
      options: [
        new IntegerNumberType([
          new IntegerNumberInterval({
            bottom: this.value,
            upper: this.value,
          }),
        ]),
      ],
    };
  }
}
