import { MetaType } from ".";
import { BaseType } from "../BaseType";

export class UnionMetaType extends MetaType {
  constructor(public readonly options: BaseType[]) {
    super();
  }
  public union(type: MetaType): MetaType {
    return this;
  }
  public intersect(type: MetaType): MetaType {
    return this;
  }
  public display(): string {
    return this.options.map(type => type.display()).join(" ∪ ");
  }
}
