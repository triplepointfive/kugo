import { Maybe } from "../../../utils/Maybe";
import { Context } from "../../Context";
import { KugoError } from "../../KugoError";
import { MetaType } from "../../Type/Meta";
import { AddedFunctionAnnotation } from "../AddedFunctionAnnotation";
import { BuiltInFunctionAnnotation } from "../BuiltInFunctionAnnotation";
import { FunctionAnnotationVisitor } from "./FunctionAnnotationVisitor";
import { TypeCheckAstVisitor } from "./TypeCheckAstVisitor";

export class TypeCheckFunctionAnnotationVisitor extends FunctionAnnotationVisitor<
  Maybe<MetaType>
> {
  public static check(context: Context): Maybe<undefined> {
    let errors: KugoError[] = [];
    const checker = new TypeCheckFunctionAnnotationVisitor(context);

    for (const [, fa] of context.global.entries()) {
      const checkResult = fa.visit(checker);
      if (checkResult.failed) {
        errors = errors.concat(checkResult.errors);
      }
    }

    if (errors.length) {
      return Maybe.fail(errors);
    }

    return Maybe.just(undefined);
  }

  protected constructor(context: Context) {
    super(context);
  }

  public visitBuiltIn(fa: BuiltInFunctionAnnotation): Maybe<MetaType> {
    return Maybe.just(fa.returnType);
  }

  public visitAdded(fa: AddedFunctionAnnotation): Maybe<MetaType> {
    return fa.body.visit(new TypeCheckAstVisitor(this.context, fa.args));
  }
}
