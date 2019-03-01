import { Context } from "../../Context";
import { NCall } from "../NCall";
import { NConstant } from "../NConstant";

export abstract class AstVisitor<T> {
  constructor(protected context: Context) {}

  public abstract visitInvocation(invocation: NCall): T;

  public abstract visitConstant(constant: NConstant): T;
}
