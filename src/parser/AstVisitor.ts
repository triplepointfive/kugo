import { KugoParser } from "./Parser"
import { PApp, PFunctionDeclaration, PExpression } from "./AST"
import { tail } from "lodash"

const parserInstance = new KugoParser()
const BaseKugoVisitor = parserInstance.getBaseCstVisitorConstructor()

export class KugoToAstVisitor extends BaseKugoVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  app(ctx: any): PApp {
    return {
      functionDeclarations: ctx.functionDeclaration.map((fd: any) =>
        this.visit(fd)
      )
    }
  }

  functionDeclaration(ctx: any): PFunctionDeclaration {
    return {
      name: ctx.Identity[0].image,
      args: tail(ctx.Identity).map((token: any): string => token.image),
      expression: this.visit(ctx.expression)
    }
  }

  expression(ctx: any): PExpression {
    if (ctx.functionCall) {
      return this.visit(ctx.functionCall)
    } else if (ctx.Const) {
      return this.buildConst(ctx)
    } else {
      // When it's wrapped with parentheses
      return this.visit(ctx.expression)
    }
  }

  functionCall(ctx: any): PExpression {
    return {
      type: "call",
      name: ctx.Identity[0].image,
      args: (ctx.functionArg || []).map((exp: any) => this.visit(exp))
    }
  }

  functionArg(ctx: any): PExpression {
    if (ctx.Identity) {
      return {
        type: "call",
        name: ctx.Identity[0].image,
        args: []
      }
    } else if (ctx.Const) {
      return this.buildConst(ctx)
    } else {
      // When it's wrapped with parentheses
      return this.visit(ctx.expression)
    }
  }

  private buildConst(ctx: any): PExpression {
    return {
      type: "number",
      value: parseInt(ctx.Const[0].image) // TODO: It's not always an integer
    }
  }
}
