import { KugoError } from "../core/KugoError";

export class Maybe<T> {
  public errors: KugoError[] = [];
  public value?: T;

  constructor(val: T | KugoError[]) {
    if (val instanceof Array) {
      this.errors = val;
    } else {
      this.value = val;
    }
  }

  public map<R>(f: (t: T) => R | KugoError[]): Maybe<R> {
    if (this.value) {
      return new Maybe(f(this.value));
    }
    return new Maybe<R>(this.errors);
  }

  get failed(): boolean {
    return this.errors.length > 0;
  }
}
