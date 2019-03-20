import {
  AnyMetaType,
  FunctionAnnotation,
  NeverMetaType,
  UnionMetaType,
} from "../../../..";
import { MetaTypeVisitor } from "./MetaTypeVisitor";

export class DisplayMetaTypeVisitor extends MetaTypeVisitor<string> {
  public static build(fa: FunctionAnnotation): string {
    const visitor = new DisplayMetaTypeVisitor();

    return fa
      .types()
      .map(({ args, result }) => {
        if (args.length) {
          return `${args
            .map(type => type.visit(visitor))
            .join(" → ")} → ${result.visit(visitor)}`;
        } else {
          return result.visit(visitor);
        }
      })
      .join(" | ");
  }

  private anyChar: Map<number, string> = new Map();
  private nextIndex = 0;

  constructor() {
    super();
  }

  public visitUnion({ options }: UnionMetaType): string {
    return options.map(type => type.display()).join(" ∪ ");
  }

  public visitNever(type: NeverMetaType): string {
    return "never";
  }

  public visitAny({ index }: AnyMetaType): string {
    const foundChar = this.anyChar.get(index);

    if (foundChar) {
      return foundChar;
    }

    const nextChar = String.fromCharCode(97 + this.nextIndex);
    this.nextIndex += 1;
    this.anyChar.set(index, nextChar);
    return nextChar;
  }
}
