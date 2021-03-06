import {
  createToken,
  createTokenInstance,
  ILexingError,
  ILexingResult,
  Lexer,
} from "chevrotain";
import _ from "lodash";
import { KugoError } from "../..";
import { Maybe } from "../../utils/Maybe";
import { execIndent, indentationLevels, reset } from "./IndentParser";

export const Const = createToken({
  name: "Const",
  pattern: /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/,
});
export const Identity = createToken({
  name: "Identity",
  pattern: /[a-zA-Z]+\w*/,
});
export const Operator = createToken({
  name: "Operator",
  pattern: /(>|==|<)/,
});

export const Define = createToken({ name: "Define", pattern: "=" });
export const VerticalBar = createToken({ name: "VerticalBar", pattern: "|" });
export const OpenParentheses = createToken({
  name: "OpenParentheses",
  pattern: "(",
});
export const CloseParentheses = createToken({
  name: "CloseParentheses",
  pattern: ")",
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
  pattern: (...args) => execIndent("indent", ...args),
});

export const Outdent = createToken({
  // custom token patterns should explicitly specify the line_breaks option
  line_breaks: false,
  name: "Outdent",
  pattern: (...args) => execIndent("outdent", ...args),
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
  Operator,
  Define,
  VerticalBar,
];

const KugoLexer = new Lexer(allTokens, { ensureOptimizations: false });

export function tokenize(text: string): Maybe<ILexingResult> {
  reset();
  const lexResult = KugoLexer.tokenize(text);

  // add remaining Outdents
  while (indentationLevels.length > 1) {
    lexResult.tokens.push(
      createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN),
    );
    indentationLevels.pop();
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
