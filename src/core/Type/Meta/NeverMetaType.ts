import { MetaType } from ".";
import { BaseType } from "../BaseType";

export class NeverMetaType extends MetaType {
  public union(type: MetaType): MetaType {
    return this;
  }

  public intersect(type: MetaType): MetaType {
    return this;
  }

  public intersectType(type: BaseType): MetaType {
    return this;
  }

  public display(): string {
    return "never";
  }
}
