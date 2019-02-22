import { IntegerNumberInterval } from "./IntegerNumberInterval";
import { IntegerNumberType } from "./IntegerNumberType";
export class NaturalNumberType extends IntegerNumberType {
  constructor() {
    super([new IntegerNumberInterval({ bottom: 1 })]);
  }
  public display(): string {
    return "ℕ";
  }
}
