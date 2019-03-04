import { BaseType } from "../BaseType";
import { DisplayMetaTypeVisitor } from "./Visitor/DisplayMetaTypeVisitor";
import { MetaTypeVisitor } from "./Visitor/MetaTypeVisitor";

export abstract class MetaType {
  public abstract union(type: MetaType): MetaType;
  public abstract intersect(type: MetaType): MetaType;
  public abstract intersectType(type: BaseType): MetaType;
  public abstract visit<T>(visitor: MetaTypeVisitor<T>): T;

  public display(): string {
    return this.visit(new DisplayMetaTypeVisitor());
  }
}
