import { reduce } from "lodash";
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
    const builtArgs: MetaType[] = [];

    for (const arg of args) {
      const checkResult = arg.visit(this);

      checkResult.with(
        expressionType => builtArgs.push(expressionType),
        checkErrors => errors.concat(checkErrors),
      );
    }

    if (errors.length) {
      return Maybe.fail(errors);
    }

    return this.withBuiltArgs(name, fa, builtArgs);
  }

  private withBuiltArgs(
    name: string,
    fa: FunctionAnnotation,
    inputArgs: MetaType[],
  ): Maybe<MetaType> {
    let matchingFunctionTypes = fa.types;

    for (const [i, actualType] of inputArgs.entries()) {
      const filteredTypes = matchingFunctionTypes.filter(({ args }) =>
        IsSubsetMetaTypeVisitor.check(actualType, args[i]),
      );

      if (filteredTypes.length === 0) {
        const expectedType = reduce(
          matchingFunctionTypes.map(({ args }) => args[i]),
          (acc, result) => acc.union(result),
        );

        return Maybe.fail(
          new KugoError(
            `${name}: expected ${i + 1} arg of type ${expectedType &&
              expectedType.display()} but got ${actualType.display()}`,
          ),
        );
      }

      matchingFunctionTypes = filteredTypes;
    }

    const resultType = reduce(
      fa.types
        .filter(type => type.matchArgs(inputArgs))
        .map(({ result }) => result),
      (acc, result) => acc.union(result),
    );

    if (resultType === undefined) {
      return Maybe.fail(
        new KugoError(`Function ${name} has no matching types`),
      );
    }
    return Maybe.just(resultType);
  }
}
