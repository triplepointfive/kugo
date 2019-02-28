import { AnyMetaType } from "../AnyMetaType";
import { NeverMetaType } from "../NeverMetaType";
import { UnionMetaType } from "../UnionMetaType";

export abstract class MetaTypeVisitor<T> {
  public abstract visitUnion(type: UnionMetaType): T;
  public abstract visitNever(type: NeverMetaType): T;
  public abstract visitAny(type: AnyMetaType): T;
}
