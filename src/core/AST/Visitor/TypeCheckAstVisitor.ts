import { FunctionArgs } from "..";
import { FunctionAnnotation, KugoError } from "../../..";
import { Maybe } from "../../../utils/Maybe";
import { Context } from "../../Context";
import { MetaType } from "../../Type/Meta";
import { IsSubsetMetaTypeVisitor } from "../../Type/Meta/Visitor/IsSubsetMetaTypeVisitor";
import { NCall } from "../NCall";
import { NConstant } from "../NConstant";
import { AstVisitor } from "./AstVisitor";

export class TypeCheckAstVisitor extends AstVisitor<Maybe<MetaType>> {
  constructor(context: Context, private functionArgs: FunctionArgs) {
    super(context);
  }

  public visitInvocation(call: NCall): Maybe<MetaType> {
    const fa = this.context.lookupFunction(call.name);

    if (fa === undefined) {
      const variable = this.functionArgs.find(({ name }) => name === call.name);

      if (variable === undefined) {
        return Maybe.fail(new KugoError(`Function ${call.name} is not found`));
      } else {
        return Maybe.just(variable.type);
      }
    } else {
      return this.withFunctionAnnotation(call, fa);
    }
  }

  public visitConstant(constant: NConstant): Maybe<MetaType> {
    return Maybe.just(constant.type);
  }

  private withFunctionAnnotation(
    { name, args }: NCall,
    fa: FunctionAnnotation,
  ): Maybe<MetaType> {
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
}
