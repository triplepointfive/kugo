import { createToken, Lexer } from "chevrotain";

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
export const Space = createToken({
  group: Lexer.SKIPPED,
  name: "Space",
  pattern: /[ \t]+/,
});
export const NewLine = createToken({
  name: "NewLine",
  pattern: /\n+/,
});

export const allTokens = [
  Identity,
  Const,
  Space,
  OpenParentheses,
  CloseParentheses,
  NewLine,
  Define,
];
export const KugoLexer = new Lexer(allTokens, { ensureOptimizations: true });
