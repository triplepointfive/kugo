import { type } from "os";
import { foldl1 } from "../../../utils";
import { Maybe } from "../../../utils/Maybe";
import { Context } from "../../Context";
import { KugoError } from "../../KugoError";
import { AddedFunctionAnnotation } from "../AddedFunctionAnnotation";
import { BuiltInFunctionAnnotation } from "../BuiltInFunctionAnnotation";
import { FunctionAnnotationVisitor } from "./FunctionAnnotationVisitor";
import { TypeCheckAstVisitor } from "./TypeCheckAstVisitor";

export class TypeCheckFunctionAnnotationVisitor extends FunctionAnnotationVisitor<
  Maybe<undefined>
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

  public visitBuiltIn(fa: BuiltInFunctionAnnotation): Maybe<undefined> {
    return Maybe.just(undefined);
  }

  public visitAdded(fa: AddedFunctionAnnotation): Maybe<undefined> {
    // TODO: Apply guard type restrictions here
    return foldl1(
      fa.guards.map(({ body }, i) =>
        body.visit(
          new TypeCheckAstVisitor(
            this.context,
            fa.args.map((name, j) => {
              // TODO: This is so incorrect
              return { name, type: fa.types[0].args[j] };
            }),
          ),
        ),
      ),
    ).map(() => Maybe.just(undefined));
  }
}
