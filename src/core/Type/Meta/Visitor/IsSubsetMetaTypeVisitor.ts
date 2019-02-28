import { MetaTypeVisitor } from "./MetaTypeVisitor";
import { UnionMetaType, NeverMetaType, AnyMetaType } from "../../../..";
import { MetaType } from "..";

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

class NeverSubsetMetaTypeVisitor extends MetaTypeVisitor<boolean> {
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

class AnySubsetMetaTypeVisitor extends MetaTypeVisitor<boolean> {
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

class UnionSubsetMetaTypeVisitor extends MetaTypeVisitor<boolean> {
  constructor(private origin: UnionMetaType) {
    super();
  }

  public visitUnion(dest: UnionMetaType): boolean {
    return this.origin.options.every(type => {
      // TODO: OMG, compare it better
      return dest.intersectType(type).display() == type.display();
    });
  }

  public visitNever(dest: NeverMetaType): boolean {
    return false;
  }

  public visitAny(dest: AnyMetaType): boolean {
    return true;
  }
}
