import { BaseType } from "../BaseType";

export abstract class MetaType {
  public abstract union(type: MetaType): MetaType;
  public abstract intersect(type: MetaType): MetaType;
  public abstract intersectType(type: BaseType): MetaType;
  public abstract display(): string;
}
