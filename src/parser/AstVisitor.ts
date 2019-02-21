import { tail } from "lodash";
import { IPApp, IPExpression, IPFunctionDeclaration } from "./AST";
import { KugoParser } from "./Parser";

const parserInstance = new KugoParser();
const BaseKugoVisitor = parserInstance.getBaseCstVisitorConstructor();

export class KugoToAstVisitor extends BaseKugoVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  public app(ctx: any): IPApp {
    return {
      functionDeclarations: (ctx.functionDeclaration || []).map((fd: any) =>
        this.visit(fd),
      ),
    };
  }

  public functionDeclaration(ctx: any): IPFunctionDeclaration {
    return {
      args: tail(ctx.Identity).map((token: any): string => token.image),
      expression: this.visit(ctx.expression),
      name: ctx.Identity[0].image,
    };
  }

  public expression(ctx: any): IPExpression {
    if (ctx.functionCall) {
      return this.visit(ctx.functionCall);
    } else if (ctx.Const) {
      return this.buildConst(ctx);
    } else {
      // When it's wrapped with parentheses
      return this.visit(ctx.expression);
    }
  }

  public functionCall(ctx: any): IPExpression {
    return {
      args: (ctx.functionArg || []).map((exp: any) => this.visit(exp)),
      name: ctx.Identity[0].image,
      type: "call",
    };
  }

  public functionArg(ctx: any): IPExpression {
    if (ctx.Identity) {
      return {
        args: [],
        name: ctx.Identity[0].image,
        type: "call",
      };
    } else if (ctx.Const) {
      return this.buildConst(ctx);
    } else {
      // When it's wrapped with parentheses
      return this.visit(ctx.expression);
    }
  }

  private buildConst(ctx: any): IPExpression {
    return {
      type: "number",
      value: parseInt(ctx.Const[0].image, 10), // TODO: It's not always an integer
    };
  }
}
