import { tail } from "lodash";
import { PApp } from "./AST";
import { CallPExpression } from "./AST/CallPExpression";
import { NumberPExpression } from "./AST/NumberPExpression";
import { PExpression } from "./AST/PExpression";
import { PFunctionDeclaration } from "./AST/PFunctionDeclaration";
import {
  ElsePPredicate,
  EqualPPredicate,
  LessPPredicate,
  MorePPredicate,
  PGuard,
  PPredicate,
} from "./AST/PGuard";
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
    let body = [];

    if (ctx.functionDeclarationBody !== undefined) {
      body = [
        new PGuard(
          new ElsePPredicate(),
          this.visit(ctx.functionDeclarationBody),
        ),
      ];
    } else {
      body = ctx.guardClause.map((clause: any) => this.visit(clause));
    }

    return new PFunctionDeclaration(
      ctx.Identity[0].image,
      tail(ctx.Identity).map((token: any): string => token.image),
      body,
    );
  }

  public guardClause(ctx: any): any {
    return new PGuard(
      this.buildPredicate(ctx),
      this.visit(ctx.functionDeclarationBody),
    );
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

  private buildConst(ctx: any): NumberPExpression {
    // TODO: It's not always an integer
    return new NumberPExpression(parseInt(ctx.Const[0].image, 10));
  }

  private buildPredicate(ctx: any): PPredicate {
    const image = ctx.Identity[0].image;
    switch (ctx.Operator[0].image) {
      case "==":
        return new EqualPPredicate(image, this.buildConst(ctx));
      case ">":
        return new MorePPredicate(image, this.buildConst(ctx));
      case "<":
        return new LessPPredicate(image, this.buildConst(ctx));
    }

    throw new Error(`Failed to parse operator ${ctx}`);
  }
}
