import { MetaType } from ".";

export class AnyMetaType extends MetaType {
  public union(type: MetaType): MetaType {
    return this;
  }

  public intersect(type: MetaType): MetaType {
    return type;
  }

  public display(): string {
    return "any";
  }
}
