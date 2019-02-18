import { createToken, Lexer } from "chevrotain"

export const Const = createToken({ name: "Const", pattern: /\d+/ }),
  Identity = createToken({ name: "Identity", pattern: /[a-zA-Z]+\w*/ }),
  Define = createToken({ name: "Define", pattern: /=/ }),
  Space = createToken({
    name: "Space",
    pattern: /[ \t]+/,
    group: Lexer.SKIPPED
  }),
  NewLine = createToken({
    name: "NewLine",
    pattern: /\n+/
  }),
  allTokens = [Const, Identity, Define, Space, NewLine],
  KugoLexer = new Lexer(allTokens, { ensureOptimizations: true })
