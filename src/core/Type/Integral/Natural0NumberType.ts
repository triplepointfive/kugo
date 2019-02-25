import { IntegerNumberInterval } from "./IntegerNumberInterval";
import { IntegerNumberType } from "./IntegerNumberType";

export class Natural0NumberType extends IntegerNumberType {
  constructor() {
    super([new IntegerNumberInterval({ bottom: 0 })]);
  }
  public display(): string {
    return "ℕ0";
  }
}
