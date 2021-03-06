/**
 * Original by Samuel Flores
 *
 * Adds the following new token classes:
 *     constant, builtin, variable, symbol, regex
 */
(({ languages }) => {
  languages.ruby = languages.extend("clike", {
    comment: [
      /#.*/,
      {
        pattern: /^=begin\s[\s\S]*?^=end/m,
        greedy: true,
      },
    ],
    "class-name": {
      pattern: /(\b(?:class)\s+|\bcatch\s+\()[\w.\\]+/i,
      lookbehind: true,
      inside: {
        punctuation: /[.\\]/,
      },
    },
    keyword:
      /\b(?:BEGIN|END|alias|and|begin|break|case|class|def|define_method|defined|do|each|else|elsif|end|ensure|extend|for|if|in|include|module|new|next|nil|not|or|prepend|private|protected|public|raise|redo|require|rescue|retry|return|self|super|then|throw|undef|unless|until|when|while|yield)\b/,
  });

  const interpolation = {
    pattern: /#\{[^}]+\}/,
    inside: {
      delimiter: {
        pattern: /^#\{|\}$/,
        alias: "tag",
      },
      rest: languages.ruby,
    },
  };

  delete languages.ruby.function;

  languages.insertBefore("ruby", "keyword", {
    regex: [
      {
        pattern: RegExp(
          `${/%r/.source}(?:${[
            /([^a-zA-Z0-9\s{(\[<])(?:(?!\1)[^\\]|\\[\s\S])*\1/.source,
            /\((?:[^()\\]|\\[\s\S])*\)/.source,
            // Here we need to specifically allow interpolation
            /\{(?:[^#{}\\]|#(?:\{[^}]+\})?|\\[\s\S])*\}/.source,
            /\[(?:[^\[\]\\]|\\[\s\S])*\]/.source,
            /<(?:[^<>\\]|\\[\s\S])*>/.source,
          ].join("|")})${/[egimnosux]{0,6}/.source}`
        ),
        greedy: true,
        inside: {
          interpolation: interpolation,
        },
      },
      {
        pattern:
          /(^|[^/])\/(?!\/)(?:\[[^\r\n\]]+\]|\\.|[^[/\\\r\n])+\/[egimnosux]{0,6}(?=\s*(?:$|[\r\n,.;})#]))/,
        lookbehind: true,
        greedy: true,
        inside: {
          interpolation: interpolation,
        },
      },
    ],
    variable: /[@$]+[a-zA-Z_]\w*(?:[?!]|\b)/,
    symbol: {
      pattern: /(^|[^:]):[a-zA-Z_]\w*(?:[?!]|\b)/,
      lookbehind: true,
    },
    "method-definition": {
      pattern: /(\bdef\s+)[\w.]+/,
      lookbehind: true,
      inside: {
        function: /\w+$/,
        rest: languages.ruby,
      },
    },
  });

  languages.insertBefore("ruby", "number", {
    builtin:
      /\b(?:Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Fixnum|Float|Hash|IO|Integer|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|Stat|String|Struct|Symbol|TMS|Thread|ThreadGroup|Time|TrueClass)\b/,
    constant: /\b[A-Z]\w*(?:[?!]|\b)/,
  });

  languages.ruby.string = [
    {
      pattern: RegExp(
        `${/%[qQiIwWxs]?/.source}(?:${[
          /([^a-zA-Z0-9\s{(\[<])(?:(?!\1)[^\\]|\\[\s\S])*\1/.source,
          /\((?:[^()\\]|\\[\s\S])*\)/.source,
          // Here we need to specifically allow interpolation
          /\{(?:[^#{}\\]|#(?:\{[^}]+\})?|\\[\s\S])*\}/.source,
          /\[(?:[^\[\]\\]|\\[\s\S])*\]/.source,
          /<(?:[^<>\\]|\\[\s\S])*>/.source,
        ].join("|")})`
      ),
      greedy: true,
      inside: {
        interpolation: interpolation,
      },
    },
    {
      pattern:
        /("|')(?:#\{[^}]+\}|#(?!\{)|\\(?:\r\n|[\s\S])|(?!\1)[^\\#\r\n])*\1/,
      greedy: true,
      inside: {
        interpolation: interpolation,
      },
    },
    {
      pattern: /<<[-~]?([a-z_]\w*)[\r\n](?:.*[\r\n])*?[\t ]*\1/i,
      alias: "heredoc-string",
      greedy: true,
      inside: {
        delimiter: {
          pattern: /^<<[-~]?[a-z_]\w*|[a-z_]\w*$/i,
          alias: "symbol",
          inside: {
            punctuation: /^<<[-~]?/,
          },
        },
        interpolation: interpolation,
      },
    },
    {
      pattern: /<<[-~]?'([a-z_]\w*)'[\r\n](?:.*[\r\n])*?[\t ]*\1/i,
      alias: "heredoc-string",
      greedy: true,
      inside: {
        delimiter: {
          pattern: /^<<[-~]?'[a-z_]\w*'|[a-z_]\w*$/i,
          alias: "symbol",
          inside: {
            punctuation: /^<<[-~]?'|'$/,
          },
        },
      },
    },
  ];

  languages.rb = languages.ruby;
})(Prism);
