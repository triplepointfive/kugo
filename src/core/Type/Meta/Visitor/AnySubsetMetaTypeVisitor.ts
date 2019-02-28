import { AnyMetaType, NeverMetaType, UnionMetaType } from "../../../..";
import { MetaTypeVisitor } from "./MetaTypeVisitor";
export class AnySubsetMetaTypeVisitor extends MetaTypeVisitor<boolean> {
  constructor(private origin: AnyMetaType) {
    super();
  }
  public visitUnion(dest: UnionMetaType): boolean {
    return false;
  }
  public visitNever(dest: NeverMetaType): boolean {
    return false;
  }
  public visitAny(dest: AnyMetaType): boolean {
    return true;
  }
}
