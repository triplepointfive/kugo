import { BaseTypeVisitor } from "./BaseTypeVisitor";

export abstract class BaseType {
  public abstract display(): string;
  public abstract visit<T>(visitor: BaseTypeVisitor<T>): T;
}
