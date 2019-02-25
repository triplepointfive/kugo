export interface IMetaType {
  // This is a union of multiple types
  options: BaseType[];
}

export abstract class BaseType {
  public abstract display(): string;
}
