import { KugoError } from "../../..";
import { Maybe } from "../../../utils/Maybe";
import { MetaType } from "../../Type/Meta";
import { IsSubsetMetaTypeVisitor } from "../../Type/Meta/Visitor/IsSubsetMetaTypeVisitor";
import { NCall } from "../NCall";
import { NConstant } from "../NConstant";
import { AstVisitor } from "./AstVisitor";

export class TypeCheckAstVisitor extends AstVisitor<Maybe<MetaType>> {
  public visitInvocation({ name, args }: NCall): Maybe<MetaType> {
    const fa = this.context.lookupFunction(name);

    if (fa === undefined) {
      return Maybe.fail(new KugoError(`Function ${name} is not found`));
    }

    const errors: KugoError[] = [];

    for (const [i, arg] of args.entries()) {
      const checkResult = arg.visit(this);

      checkResult.with(
        expressionType => {
          const expectedType = fa.args[i].type;
          if (!IsSubsetMetaTypeVisitor.check(expressionType, expectedType)) {
            errors.push(
              new KugoError(
                `${name}: expected ${i} arg of type ${expectedType.display()} but got ${expressionType.display()}`,
              ),
            );
          }
        },
        checkErrors => errors.concat(checkErrors),
      );
    }

    if (errors.length) {
      return Maybe.fail(errors);
    }

    return Maybe.just(fa.returnType);
  }

  public visitConstant(constant: NConstant): Maybe<MetaType> {
    return Maybe.just(constant.type);
  }
}
