import { AnyMetaType, NeverMetaType, UnionMetaType } from "../../../..";
import { MetaTypeVisitor } from "./MetaTypeVisitor";

export class UnionSubsetMetaTypeVisitor extends MetaTypeVisitor<boolean> {
  constructor(private origin: UnionMetaType) {
    super();
  }

  public visitUnion(dest: UnionMetaType): boolean {
    return this.origin.options.every(type => {
      // TODO: OMG, compare it better
      return dest.intersectType(type).display() === type.display();
    });
  }

  public visitNever(dest: NeverMetaType): boolean {
    return false;
  }

  public visitAny(dest: AnyMetaType): boolean {
    return true;
  }
}
