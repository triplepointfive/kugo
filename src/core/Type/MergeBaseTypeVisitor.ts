import { IntegerNumberType } from "../..";
import { BaseType } from "./BaseType";
import { BaseTypeVisitor } from "./BaseTypeVisitor";
import { MergeIntegralTypeVisitor } from "./MergeIntegralTypeVisitor";

export class MergeBaseTypeVisitor extends BaseTypeVisitor<
  BaseTypeVisitor<BaseType | undefined>
> {
  public visitIntegral(
    type: IntegerNumberType,
  ): BaseTypeVisitor<BaseType | undefined> {
    return new MergeIntegralTypeVisitor(type);
  }
}
