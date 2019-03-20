import { MetaType } from "../Type/Meta";
import { DisplayMetaTypeVisitor } from "../Type/Meta/Visitor/DisplayMetaTypeVisitor";
import { IsSubsetMetaTypeVisitor } from "../Type/Meta/Visitor/IsSubsetMetaTypeVisitor";
import { FunctionAnnotationVisitor } from "./Visitor/FunctionAnnotationVisitor";

export class FunctionType {
  constructor(
    public readonly args: MetaType[],
    public readonly result: MetaType,
  ) {}

  public matchArgs(types: MetaType[]): boolean {
    return types.every((actualType, index) => {
      const expectedType = this.args[index];

      return (
        expectedType && IsSubsetMetaTypeVisitor.check(actualType, expectedType)
      );
    });
  }
}

// tslint:disable-next-line: max-classes-per-file
export abstract class FunctionAnnotation {
  constructor(public readonly args: string[]) {}

  public abstract visit<T>(visitor: FunctionAnnotationVisitor<T>): T;
  public abstract types(): FunctionType[];

  public displayType(): string {
    return DisplayMetaTypeVisitor.build(this);
  }
}
