import { createTokenInstance, IToken } from "chevrotain";
import { Outdent } from ".";
import { IndentParser } from "./IndentParser";

export class DecreaseIndentParser extends IndentParser {
  protected withIndentLevel(
    currIndentLevel: number,
    lastIndentLevel: number,
    match: any,
    matchedTokens?: IToken[],
  ): RegExpExecArray | null {
    if (currIndentLevel > lastIndentLevel) {
      return null;
    }

    while (
      // if we need more than one outdent token, add all but the last one
      IndentParser.indentStack.length > 2 &&
      // stop before the last Outdent
      IndentParser.indentStack[IndentParser.indentStack.length - 2] >
        currIndentLevel
    ) {
      IndentParser.indentStack.pop();

      if (matchedTokens) {
        matchedTokens.push(
          createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN),
        );
      }
    }

    IndentParser.indentStack.pop();
    return match as RegExpExecArray;
  }
}
