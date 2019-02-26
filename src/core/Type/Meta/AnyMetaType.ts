import { MetaType } from ".";
import { BaseType } from "../BaseType";
import { UnionMetaType } from "./UnionMetaType";

export class AnyMetaType extends MetaType {
  public union(type: MetaType): MetaType {
    return this;
  }

  public intersect(type: MetaType): MetaType {
    return type;
  }

  public intersectType(type: BaseType): MetaType {
    return new UnionMetaType([type]);
  }

  public display(): string {
    return "any";
  }
}
