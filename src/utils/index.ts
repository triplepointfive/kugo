import { concat, reduce } from "lodash";
import { KugoError } from "../core/KugoError";
import { Maybe } from "./Maybe";

export function foldl1<T>(list: Array<Maybe<T>>): Maybe<T[]> {
  if (list.length === 0) {
    return Maybe.fail(new KugoError("Collection is empty"));
  }

  // TODO: accumulate errors as well
  return reduce(
    list,
    (macc, mv) => mv.map(v => macc.map(acc => Maybe.just(concat(acc, [v])))),
    list[0].map(v => Maybe.just([v])),
  );
}
