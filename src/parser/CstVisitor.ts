import { tail } from "lodash";
import { PApp } from "./AST";
import { CallPExpression } from "./AST/CallPExpression";
import { NumberPExpression } from "./AST/NumberPExpression";
import { PExpression } from "./AST/PExpression";
import { PFunctionDeclaration } from "./AST/PFunctionDeclaration";
import { KugoParser } from "./Parser";

const parserInstance = new KugoParser();
const BaseKugoVisitor = parserInstance.getBaseCstVisitorConstructor();

export class CstVisitor extends BaseKugoVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  public app(ctx: any): PApp {
    return {
      functionDeclarations: (ctx.functionDeclaration || []).map((fd: any) =>
        this.visit(fd),
      ),
    };
  }

  public functionDeclaration(ctx: any): PFunctionDeclaration {
    return new PFunctionDeclaration(
      ctx.Identity[0].image,
      tail(ctx.Identity).map((token: any): string => token.image),
      this.visit(ctx.functionDeclarationBody),
    );
  }

  public guardClause(ctx: any): any {
    console.log("guardClause", ctx);
  }

  public functionDeclarationBody(ctx: any): any {
    return this.visit(ctx.expression);
  }

  public expression(ctx: any): PExpression {
    if (ctx.functionCall) {
      return this.visit(ctx.functionCall);
    } else if (ctx.Const) {
      return this.buildConst(ctx);
    } else {
      // When it's wrapped with parentheses
      return this.visit(ctx.expression);
    }
  }

  public functionCall(ctx: any): PExpression {
    return new CallPExpression(
      ctx.Identity[0].image,
      (ctx.functionArg || []).map((exp: any) => this.visit(exp)),
    );
  }

  public functionArg(ctx: any): PExpression {
    if (ctx.Identity) {
      return new CallPExpression(ctx.Identity[0].image, []);
    } else if (ctx.Const) {
      return this.buildConst(ctx);
    } else {
      // When it's wrapped with parentheses
      return this.visit(ctx.expression);
    }
  }

  private buildConst(ctx: any): PExpression {
    // TODO: It's not always an integer
    return new NumberPExpression(parseInt(ctx.Const[0].image, 10));
  }
}
