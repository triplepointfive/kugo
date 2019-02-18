export interface PApp {
  functionDeclarations: PFunctionDeclaration[]
}

export interface PFunctionDeclaration {
  name: string
  args: string[]
  expression: PExpression
}

export type PExpression =
  | { type: "call"; name: string; args: PExpression[] }
  | { type: "number"; value: number }
