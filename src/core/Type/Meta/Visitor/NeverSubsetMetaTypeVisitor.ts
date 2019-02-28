import { AnyMetaType, NeverMetaType, UnionMetaType } from "../../../..";
import { MetaTypeVisitor } from "./MetaTypeVisitor";
export class NeverSubsetMetaTypeVisitor extends MetaTypeVisitor<boolean> {
  constructor(private origin: NeverMetaType) {
    super();
  }
  public visitUnion(dest: UnionMetaType): boolean {
    return true;
  }
  public visitNever(dest: NeverMetaType): boolean {
    return true;
  }
  public visitAny(dest: AnyMetaType): boolean {
    return true;
  }
}
