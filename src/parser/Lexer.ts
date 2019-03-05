import {
  createToken,
  createTokenInstance,
  ILexingError,
  ILexingResult,
  IToken,
  Lexer,
} from "chevrotain";
import _ from "lodash";
import { KugoError } from "..";
import { Maybe } from "../utils/Maybe";

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
function matchWhiteSpace(text: string, startOffset: number): null | string[] {
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

let indentStack = [0];
let lastOffsetChecked: number | undefined;

/**
 * This custom Token matcher uses Lexer context ("matchedTokens" and "groups" arguments)
 * combined with state via closure ("indentStack" and "lastTextMatched") to match indentation.
 *
 * @param {string} text - remaining text to lex, sent by the Chevrotain lexer.
 * @param {IToken[]} matchedTokens - Tokens lexed so far, sent by the Chevrotain Lexer.
 * @param {object} groups - Token groups already lexed, sent by the Chevrotain Lexer.
 * @param {string} type - determines if this function matches Indent or Outdent tokens.
 * @returns {*}
 */
function matchIndentBase(
  text: string,
  offset: number,
  matchedTokens: IToken[],
  groups: any,
  type: string,
) {
  const noTokensMatchedYet = _.isEmpty(matchedTokens);
  const newLines: any[] = groups.nl;
  const noNewLinesMatchedYet = _.isEmpty(newLines);
  const isFirstLine = noTokensMatchedYet && noNewLinesMatchedYet;
  const isStartOfLine =
    // only newlines matched so far
    (noTokensMatchedYet && !noNewLinesMatchedYet) ||
    // Both newlines and other Tokens have been matched AND the last matched Token is a newline
    (!noTokensMatchedYet &&
      !noNewLinesMatchedYet &&
      (!_.isEmpty(newLines) &&
        !_.isEmpty(matchedTokens) &&
        _.last(newLines).startOffset) > _.last(matchedTokens).startOffset);

  // indentation can only be matched at the start of a line.
  if (isFirstLine || isStartOfLine) {
    let match;
    let currIndentLevel;
    const isZeroIndent = text.length < offset && text[offset] !== " ";
    if (isZeroIndent) {
      // Matching zero spaces Outdent would not consume any chars, thus it would cause an infinite loop.
      // This check prevents matching a sequence of zero spaces outdents.
      if (lastOffsetChecked !== offset) {
        currIndentLevel = 0;
        match = [""];
        lastOffsetChecked = offset;
      }
    } else {
      // possible non-empty indentation
      match = matchWhiteSpace(text, offset);
      if (match !== null) {
        currIndentLevel = match[0].length;
      }
    }

    if (currIndentLevel !== undefined) {
      const lastIndentLevel = _.last(indentStack);
      if (lastIndentLevel === undefined) {
        return null;
      }

      if (currIndentLevel > lastIndentLevel && type === "indent") {
        indentStack.push(currIndentLevel);
        return match;
      } else if (currIndentLevel < lastIndentLevel && type === "outdent") {
        // if we need more than one outdent token, add all but the last one
        if (indentStack.length > 2) {
          while (
            indentStack.length > 2 &&
            // stop before the last Outdent
            indentStack[indentStack.length - 2] > currIndentLevel
          ) {
            indentStack.pop();
            matchedTokens.push(
              createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN),
            );
          }
        }
        indentStack.pop();
        return match;
      } else {
        // same indent, this should be lexed as simple whitespace and ignored
        return null;
      }
    } else {
      // indentation cannot be matched without at least one space character.
      return null;
    }
  } else {
    // indentation cannot be matched under other circumstances
    return null;
  }
}

const matchIndent = _.partialRight(matchIndentBase, "indent");
const matchOutdent = _.partialRight(matchIndentBase, "outdent");

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
  pattern: matchIndent,
});

export const Outdent = createToken({
  // custom token patterns should explicitly specify the line_breaks option
  line_breaks: false,
  name: "Outdent",
  pattern: matchOutdent,
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
  indentStack = [0];
  lastOffsetChecked = undefined;

  const lexResult = KugoLexer.tokenize(text);

  // add remaining Outdents
  while (indentStack.length > 1) {
    lexResult.tokens.push(
      createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN),
    );
    indentStack.pop();
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
