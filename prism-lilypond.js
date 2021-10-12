(({languages}) => {
  let schemeExpression =
    /\((?:[^();"#\\]|\\[\s\S]|;.*(?!.)|"(?:[^"\\]|\\.)*"|#(?:\{(?:(?!#\})[\s\S])*#\}|[^{])|<expr>)*\)/
      .source;
  // allow for up to pow(2, recursivenessLog2) many levels of recursive brace expressions
  // For some reason, this can't be 4
  const recursivenessLog2 = 5;
  for (let i = 0; i < recursivenessLog2; i++) {
    schemeExpression = schemeExpression.replace(/<expr>/g, () => {
      return schemeExpression;
    });
  }
  schemeExpression = schemeExpression.replace(/<expr>/g, /[^\s\S]/.source);

  const lilypond = (languages.lilypond = {
    comment: /%(?:(?!\{).*|\{[\s\S]*?%\})/,
    "embedded-scheme": {
      pattern: RegExp(
        /(^|[=\s])#(?:"(?:[^"\\]|\\.)*"|[^\s()"]*(?:[^\s()]|<expr>))/.source.replace(
          /<expr>/g,
          () => {
            return schemeExpression;
          }
        ),
        "m"
      ),
      lookbehind: true,
      greedy: true,
      inside: {
        scheme: {
          pattern: /^(#)[\s\S]+$/,
          lookbehind: true,
          alias: "language-scheme",
          inside: {
            "embedded-lilypond": {
              pattern: /#\{[\s\S]*?#\}/,
              greedy: true,
              inside: {
                punctuation: /^#\{|#\}$/,
                lilypond: {
                  pattern: /[\s\S]+/,
                  alias: "language-lilypond",
                  inside: null, // see below
                },
              },
            },
            rest: languages.scheme,
          },
        },
        punctuation: /#/,
      },
    },
    string: {
      pattern: /"(?:[^"\\]|\\.)*"/,
      greedy: true,
    },
    "class-name": {
      pattern: /(\\new\s+)[\w-]+/,
      lookbehind: true,
    },
    keyword: {
      pattern: /\\[a-z][-\w]*/i,
      inside: {
        punctuation: /^\\/,
      },
    },
    operator: /[=|]|<<|>>/,
    punctuation: {
      pattern:
        /(^|[a-z\d])(?:'+|,+|[_^]?-[_^]?(?:[-+^!>._]|(?=\d))|[_^]\.?|[.!])|[{}()[\]<>^~]|\\[()[\]<>\\!]|--|__/,
      lookbehind: true,
    },
    number: /\b\d+(?:\/\d+)?\b/,
  });

  lilypond["embedded-scheme"].inside["scheme"].inside[
    "embedded-lilypond"
  ].inside["lilypond"].inside = lilypond;

  languages.ly = lilypond;
})(Prism);
