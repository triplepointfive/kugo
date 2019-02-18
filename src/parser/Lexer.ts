import { createToken, Lexer } from "chevrotain"

export const Const = createToken({ name: "Const", pattern: /\d+/ }),
  Identity = createToken({ name: "Identity", pattern: /[a-zA-Z]+\w*/ }),
  Define = createToken({ name: "Define", pattern: /=/ }),
  OpenParentheses = createToken({ name: "OpenParentheses", pattern: /\(/ }),
  CloseParentheses = createToken({ name: "CloseParentheses", pattern: /\)/ }),
  Space = createToken({
    name: "Space",
    pattern: /[ \t]+/,
    group: Lexer.SKIPPED
  }),
  NewLine = createToken({
    name: "NewLine",
    pattern: /\n+/
  })

export const allTokens = [
    Identity,
    Const,
    Space,
    OpenParentheses,
    CloseParentheses,
    NewLine,
    Define
  ],
  KugoLexer = new Lexer(allTokens, { ensureOptimizations: true })
