import { ICustomPattern, IToken } from "chevrotain";
import _ from "lodash";

export abstract class IndentParser implements ICustomPattern {
  public static indentStack = [0];
  public static lastOffsetChecked?: number;

  public static reset(): void {
    this.indentStack = [0];
    this.lastOffsetChecked = undefined;
  }

  public exec(
    text: string,
    offset: number,
    matchedTokens?: IToken[],
    groups?: { [groupName: string]: IToken[] },
  ): RegExpExecArray | null {
    // indentation can only be matched at the start of a line.
    if (!this.isFirstLineOrStartOfLine(matchedTokens, groups)) {
      return null;
    }

    return this.build(text, offset);
  }

  protected abstract withIndentLevel(
    currIndentLevel: number,
    lastIndentLevel: number,
    match: any,
  ): RegExpExecArray | null;

  protected build(text: string, offset: number): RegExpExecArray | null {
    let match;
    let currIndentLevel;
    const isZeroIndent = text.length < offset && text[offset] !== " ";
    if (isZeroIndent) {
      // Matching zero spaces Outdent would not consume any chars, thus it would cause an infinite loop.
      // This check prevents matching a sequence of zero spaces outdents.
      if (IndentParser.lastOffsetChecked !== offset) {
        currIndentLevel = 0;
        match = [""];
        IndentParser.lastOffsetChecked = offset;
      }
    } else {
      // possible non-empty indentation
      match = this.matchWhiteSpace(text, offset);
      if (match !== null) {
        currIndentLevel = match[0].length;
      }
    }

    const lastIndentLevel = _.last(IndentParser.indentStack);
    if (lastIndentLevel === undefined || currIndentLevel === undefined) {
      // indentation cannot be matched without at least one space character.
      return null;
    }

    // same indent, this should be lexed as simple whitespace and ignored
    return this.withIndentLevel(currIndentLevel, lastIndentLevel, match);
  }

  protected isFirstLineOrStartOfLine(
    matchedTokens?: IToken[],
    groups?: { [groupName: string]: IToken[] },
  ): boolean | undefined {
    const newLines: IToken[] = groups ? groups.nl : [];
    const noNewLinesMatchedYet = _.isEmpty(newLines);
    const noTokensMatchedYet = _.isEmpty(matchedTokens);

    // When first line
    if (noTokensMatchedYet && noNewLinesMatchedYet) {
      return true;
    }

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

  protected startOfLine(
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

  /**
   *
   * Works like a / +/y regExp.
   *  - Note the usage of the 'y' (sticky) flag.
   *    This can be used to match from a specific offset in the text
   *    in our case from startOffset.
   *
   * The reason this has been implemented "manually" is because the sticky flag is not supported
   * on all modern node.js versions (4.0 specifically).
   */
  protected matchWhiteSpace(
    text: string,
    startOffset: number,
  ): null | string[] {
    let result = "";
    let offset = startOffset;
    // ignoring tabs in this example
    while (text[offset] === " ") {
      offset++;
      result += " ";
    }

    if (result === "") {
      return null;
    }

    return [result];
  }
}
