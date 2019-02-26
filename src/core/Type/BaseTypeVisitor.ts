import { IntegerNumberType } from "../..";
export abstract class BaseTypeVisitor<T> {
  public abstract visitIntegral(type: IntegerNumberType): T;
}
