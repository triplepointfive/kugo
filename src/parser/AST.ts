export interface PApp {
  functionDeclarations: PFunctionDeclaration[]
}

export interface PFunctionDeclaration {
  name: string
  args: string[]
}
