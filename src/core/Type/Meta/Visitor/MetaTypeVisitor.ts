import { UnionMetaType } from "../UnionMetaType";
import { NeverMetaType } from "../NeverMetaType";
import { AnyMetaType } from "../AnyMetaType";

export abstract class MetaTypeVisitor<T> {
  public abstract visitUnion(type: UnionMetaType): T;
  public abstract visitNever(type: NeverMetaType): T;
  public abstract visitAny(type: AnyMetaType): T;
}
