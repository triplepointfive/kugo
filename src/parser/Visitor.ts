import { KugoParser } from "./Parser"
import { PApp, PFunctionDeclaration } from "./AST"
import { tail } from "lodash"

const parserInstance = new KugoParser()
const BaseKugoVisitor = parserInstance.getBaseCstVisitorConstructor()

export class KugoToAstVisitor extends BaseKugoVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  app(ctx: any): PApp {
    console.log(ctx.functionDeclaration)

    return {
      functionDeclarations: ctx.functionDeclaration.map((fd: any) =>
        this.visit(fd)
      )
    }
  }

  functionDeclaration(ctx: any): PFunctionDeclaration {
    return {
      name: ctx.Identity[0].image,
      args: tail(ctx.Identity).map((token: any): string => token.image)
    }
  }
}
