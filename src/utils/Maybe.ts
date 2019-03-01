import { castArray } from "lodash";
import { KugoError } from "../core/KugoError";

export class Maybe<T> {
  public static fail<T>(msg: ReadonlyArray<KugoError> | KugoError): Maybe<T> {
    return new Maybe<T>({ errors: castArray(msg) });
  }

  public static just<T>(value: T): Maybe<T> {
    return new Maybe<T>({ value });
  }

  public errors: KugoError[] = [];
  public value?: T;

  protected constructor(val: { value: T } | { errors: KugoError[] }) {
    if ("value" in val) {
      this.value = val.value;
    } else {
      this.errors = val.errors;
    }
  }

  public with(f: (t: T) => void): void {
    if (this.value !== undefined) {
      f(this.value);
    }
  }

  public map<R>(f: (t: T) => Maybe<R>): Maybe<R> {
    if (this.value !== undefined) {
      return f(this.value);
    }
    return Maybe.fail<R>(this.errors);
  }

  get failed(): boolean {
    return this.errors.length > 0;
  }
}
