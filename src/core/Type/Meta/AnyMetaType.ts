import { MetaType } from ".";
import { BaseType } from "../BaseType";
import { UnionMetaType } from "./UnionMetaType";
import { MetaTypeVisitor } from "./Visitor/MetaTypeVisitor";

export class AnyMetaType extends MetaType {
  constructor(public readonly index: number) {
    super();
  }

  public union(type: MetaType): MetaType {
    return this;
  }

  public intersect(type: MetaType): MetaType {
    return type;
  }

  public intersectType(type: BaseType): MetaType {
    return new UnionMetaType([type]);
  }

  public visit<T>(visitor: MetaTypeVisitor<T>): T {
    return visitor.visitAny(this);
  }
}
