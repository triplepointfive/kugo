import {
  createToken,
  createTokenInstance,
  ICustomPattern,
  ILexingError,
  ILexingResult,
  IToken,
  Lexer,
} from "chevrotain";
import _ from "lodash";
import { KugoError } from "..";
import { Maybe } from "../utils/Maybe";

class IndentParser implements ICustomPattern {
  public static indentStack = [0];
  public static lastOffsetChecked?: number;

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

  protected withIndentLevel(
    currIndentLevel: number,
    lastIndentLevel: number,
    match: any,
  ): RegExpExecArray | null {
    if (currIndentLevel < lastIndentLevel) {
      return null;
    }

    IndentParser.indentStack.push(currIndentLevel);
    return match as RegExpExecArray;
  }

  private isFirstLineOrStartOfLine(
    matchedTokens?: IToken[],
    groups?: { [groupName: string]: IToken[] },
  ): boolean {
    const noTokensMatchedYet = _.isEmpty(matchedTokens);
    const newLines: IToken[] = groups ? groups.nl : [];
    const noNewLinesMatchedYet = _.isEmpty(newLines);
    const isFirstLine = noTokensMatchedYet && noNewLinesMatchedYet;

    const lastToken = _.last(matchedTokens);
    const lastNewLine = _.last(newLines);

    const isStartOfLine =
      // only newlines matched so far
      (noTokensMatchedYet && !noNewLinesMatchedYet) ||
      // Both newlines and other Tokens have been matched AND the last matched Token is a newline
      (!noTokensMatchedYet &&
        !noNewLinesMatchedYet &&
        (!_.isEmpty(newLines) &&
          !_.isEmpty(matchedTokens) &&
          lastToken &&
          lastNewLine &&
          lastNewLine.startOffset > lastToken.startOffset));

    return !!(isFirstLine || isStartOfLine);
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
  private matchWhiteSpace(text: string, startOffset: number): null | string[] {
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

// tslint:disable-next-line: max-classes-per-file
class OutdentParser extends IndentParser {
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

export const Const = createToken({
  name: "Const",
  pattern: /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/,
});
export const Identity = createToken({
  name: "Identity",
  pattern: /[a-zA-Z]+\w*/,
});
export const Define = createToken({ name: "Define", pattern: /=/ });
export const OpenParentheses = createToken({
  name: "OpenParentheses",
  pattern: /\(/,
});
export const CloseParentheses = createToken({
  name: "CloseParentheses",
  pattern: /\)/,
});

export const Spaces = createToken({
  group: Lexer.SKIPPED,
  name: "Space",
  pattern: / +/,
});

export const NewLine = createToken({
  group: "nl",
  name: "NewLine",
  pattern: /(\n|\r\n)/,
});

// define the indentation tokens using custom token patterns
export const Indent = createToken({
  // custom token patterns should explicitly specify the line_breaks option
  line_breaks: false,
  name: "Indent",
  pattern: (...args) => new IndentParser().exec(...args),
});

export const Outdent = createToken({
  // custom token patterns should explicitly specify the line_breaks option
  line_breaks: false,
  name: "Outdent",
  pattern: (...args) => new OutdentParser().exec(...args),
});

export const allTokens = [
  NewLine,
  // indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
  // Outdent must appear before Indent for handling zero spaces outdents.
  Outdent,
  Indent,

  Spaces,
  Identity,
  Const,
  OpenParentheses,
  CloseParentheses,
  Define,
];

const KugoLexer = new Lexer(allTokens, { ensureOptimizations: false });

export function tokenize(text: string): Maybe<ILexingResult> {
  IndentParser.indentStack = [0];
  IndentParser.lastOffsetChecked = undefined;

  const lexResult = KugoLexer.tokenize(text);

  // add remaining Outdents
  while (IndentParser.indentStack.length > 1) {
    lexResult.tokens.push(
      createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN),
    );
    IndentParser.indentStack.pop();
  }

  if (lexResult.errors.length > 0) {
    return Maybe.fail(
      lexResult.errors.map(
        ({ message }: ILexingError) => new KugoError(message),
      ),
    );
  }

  return Maybe.just(lexResult);
}
