import { NConstant } from "../../../core/AST/NConstant";
import {
  ElseNPredicate,
  EqualNPredicate,
  LessNPredicate,
  MoreNPredicate,
  NPredicate,
} from "../../../core/AST/NGuard";
import {
  ElsePPredicate,
  EqualPPredicate,
  LessPPredicate,
  MorePPredicate,
  PPredicateVisitor,
} from "../PGuard";

export class BuildNGuardVisitor extends PPredicateVisitor<NPredicate> {
  public visitElse(predicate: ElsePPredicate): ElseNPredicate {
    return new ElseNPredicate();
  }

  public visitEqual(predicate: EqualPPredicate): EqualNPredicate {
    return new EqualNPredicate(
      predicate.variable,
      new NConstant(predicate.value.value, predicate.value.type),
    );
  }

  public visitLess(predicate: LessPPredicate): LessNPredicate {
    return new LessNPredicate(
      predicate.variable,
      new NConstant(predicate.value.value, predicate.value.type),
    );
  }

  public visitMore(predicate: MorePPredicate): MoreNPredicate {
    return new MoreNPredicate(
      predicate.variable,
      new NConstant(predicate.value.value, predicate.value.type),
    );
  }
}
