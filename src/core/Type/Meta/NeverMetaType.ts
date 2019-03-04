import { MetaType } from ".";
import { BaseType } from "../BaseType";
import { MetaTypeVisitor } from "./Visitor/MetaTypeVisitor";

export class NeverMetaType extends MetaType {
  public union(type: MetaType): MetaType {
    return this;
  }

  public intersect(type: MetaType): MetaType {
    return this;
  }

  public intersectType(type: BaseType): MetaType {
    return this;
  }

  public visit<T>(visitor: MetaTypeVisitor<T>): T {
    return visitor.visitNever(this);
  }
}
