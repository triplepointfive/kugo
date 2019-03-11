import { createTokenInstance, IToken } from "chevrotain";
import { NewLine } from ".";

import _ from "lodash";

function startOfLine(
  matchedTokens?: IToken[],
  groups?: { [groupName: string]: IToken[] },
): boolean | undefined {
  const newLines: IToken[] = groups ? groups.nl : [];
  const noNewLinesMatchedYet = _.isEmpty(newLines);
  const noTokensMatchedYet = _.isEmpty(matchedTokens);
  const lastToken = _.last(matchedTokens);
  const lastNewLine = _.last(newLines);

  // When start of line
  return (
    // only newlines matched so far (noTokensMatchedYet && !noNewLinesMatchedYet) ||
    !noTokensMatchedYet &&
    // Both newlines and other Tokens have been matched AND the last matched Token is a newline
    !noNewLinesMatchedYet &&
    lastToken &&
    lastNewLine &&
    lastNewLine.startOffset > lastToken.startOffset
  );
}

export let indentationLevels = [0];
let oweNewLine = false;

export function reset(): void {
  indentationLevels = [0];
  oweNewLine = false;
}

function addNewLine(matchedTokens?: IToken[]): void {
  if (matchedTokens) {
    matchedTokens.push(
      createTokenInstance(NewLine, "", NaN, NaN, NaN, NaN, NaN, NaN),
    );
  }
}

export function execIndent(
  type: "outdent" | "indent",
  text: string,
  offset: number,
  matchedTokens?: IToken[],
  groups?: { [groupName: string]: IToken[] },
): RegExpExecArray | null {
  if (oweNewLine) {
    oweNewLine = false;

    addNewLine(matchedTokens);
  }

  // indentation can only be matched at the start of a line.
  if (!startOfLine(matchedTokens, groups)) {
    return null;
  }

  const rexWith = / +/y;
  rexWith.lastIndex = offset;

  const match = text.match(rexWith);
  const lastIndentationLevel = _.last(indentationLevels) || 0;

  if (match === null) {
    // When new line with text after indentation
    if (lastIndentationLevel > 0 && type === "outdent") {
      indentationLevels = [0];

      // Doing it manually since new line is consumed
      oweNewLine = true;

      return [""] as RegExpExecArray;
    }

    if (type === "indent") {
      addNewLine(matchedTokens);
    }

    return null;
  }

  const depth = match[0].length;

  if (depth > lastIndentationLevel && type === "indent") {
    indentationLevels.push(depth);
    return match as RegExpExecArray;
  } else if (depth < lastIndentationLevel && type === "outdent") {
    indentationLevels.pop(); // Expecting outdent has same size as prev indent was
    return match as RegExpExecArray;
  }

  if (depth === _.last(indentationLevels) && type === "indent") {
    addNewLine(matchedTokens);
  }

  return null;
}
