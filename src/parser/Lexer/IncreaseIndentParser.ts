import { createTokenInstance, IToken } from "chevrotain";
import { NewLine } from ".";
import { IndentParser } from "./IndentParser";

export class IncreaseIndentParser extends IndentParser {
  public exec(
    text: string,
    offset: number,
    matchedTokens?: IToken[],
    groups?: { [groupName: string]: IToken[] },
  ): RegExpExecArray | null {
    const match = super.exec(text, offset, matchedTokens, groups);

    if (
      match === null &&
      this.startOfLine(matchedTokens, groups) &&
      matchedTokens
    ) {
      matchedTokens.push(
        createTokenInstance(NewLine, "", NaN, NaN, NaN, NaN, NaN, NaN),
      );
    }

    return match;
  }

  protected withIndentLevel(
    currIndentLevel: number,
    lastIndentLevel: number,
    match: any,
  ): RegExpExecArray | null {
    if (currIndentLevel <= lastIndentLevel) {
      return null;
    }

    IndentParser.indentStack.push(currIndentLevel);
    return match as RegExpExecArray;
  }
}
