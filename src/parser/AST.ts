export interface IPApp {
  functionDeclarations: IPFunctionDeclaration[];
}

export interface IPFunctionDeclaration {
  name: string;
  args: string[];
  expression: IPExpression;
}

export type IPExpression =
  | { type: "call"; name: string; args: IPExpression[] }
  | { type: "number"; value: number };
