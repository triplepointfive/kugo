import { MetaType } from ".";
import { BaseType } from "../BaseType";
import { MergeBaseTypeVisitor } from "../MergeBaseTypeVisitor";
import { NeverMetaType } from "./NeverMetaType";
import { MetaTypeVisitor } from "./Visitor/MetaTypeVisitor";

export class UnionMetaType extends MetaType {
  constructor(public readonly options: BaseType[]) {
    super();
  }

  public union(type: MetaType): MetaType {
    // TODO
    return this;
  }

  public intersect(type: MetaType): MetaType {
    return this.options.reduce(
      (acc, baseType) => acc.intersectType(baseType),
      type,
    );
  }

  public intersectType(baseType: BaseType): MetaType {
    const mergeOptions: BaseType[] = [];

    this.options.forEach(type => {
      const intersection = baseType.visit(
        type.visit(new MergeBaseTypeVisitor()),
      );
      if (intersection) {
        mergeOptions.push(intersection);
      }
    });

    if (mergeOptions.length === 0) {
      return new NeverMetaType();
    } else {
      return new UnionMetaType(mergeOptions);
    }
  }

  public visit<T>(visitor: MetaTypeVisitor<T>): T {
    return visitor.visitUnion(this);
  }
}
