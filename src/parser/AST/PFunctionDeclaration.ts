import { PGuard } from "./PGuard";

// TODO: Make an interface?
export class PFunctionDeclaration {
  constructor(
    public readonly name: string,
    public readonly args: string[],
    public readonly guards: PGuard[],
  ) {}
}
