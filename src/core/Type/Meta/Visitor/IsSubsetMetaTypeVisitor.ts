import { MetaType } from "..";
import { AnyMetaType, NeverMetaType, UnionMetaType } from "../../../..";
import { AnySubsetMetaTypeVisitor } from "./AnySubsetMetaTypeVisitor";
import { MetaTypeVisitor } from "./MetaTypeVisitor";
import { NeverSubsetMetaTypeVisitor } from "./NeverSubsetMetaTypeVisitor";
import { UnionSubsetMetaTypeVisitor } from "./UnionSubsetMetaTypeVisitor";

export class IsSubsetMetaTypeVisitor extends MetaTypeVisitor<
  MetaTypeVisitor<boolean>
> {
  /**
   * @returns Whether [[origin]] is a subset of [[dest]].
   */
  public static check(origin: MetaType, dest: MetaType) {
    dest.visit(
      origin.visit<MetaTypeVisitor<boolean>>(new IsSubsetMetaTypeVisitor()),
    );
  }

  protected constructor() {
    super();
  }

  public visitUnion(dest: UnionMetaType): MetaTypeVisitor<boolean> {
    return new UnionSubsetMetaTypeVisitor(dest);
  }

  public visitNever(dest: NeverMetaType): MetaTypeVisitor<boolean> {
    return new NeverSubsetMetaTypeVisitor(dest);
  }

  public visitAny(dest: AnyMetaType): MetaTypeVisitor<boolean> {
    return new AnySubsetMetaTypeVisitor(dest);
  }
}
