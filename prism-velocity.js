(({ languages }) => {
  languages.velocity = languages.extend("markup", {});

  const velocity = {
    variable: {
      pattern:
        /(^|[^\\](?:\\\\)*)\$!?(?:[a-z][\w-]*(?:\([^)]*\))?(?:\.[a-z][\w-]*(?:\([^)]*\))?|\[[^\]]+\])*|\{[^}]+\})/i,
      lookbehind: true,
      inside: {}, // See below
    },
    string: {
      pattern: /"[^"]*"|'[^']*'/,
      greedy: true,
    },
    number: /\b\d+\b/,
    boolean: /\b(?:false|true)\b/,
    operator: /[=!<>]=?|[+*/%-]|&&|\|\||\.\.|\b(?:eq|g[et]|l[et]|n(?:e|ot))\b/,
    punctuation: /[(){}[\]:,.]/,
  };

  velocity.variable.inside = {
    string: velocity["string"],
    function: {
      pattern: /([^\w-])[a-z][\w-]*(?=\()/,
      lookbehind: true,
    },
    number: velocity["number"],
    boolean: velocity["boolean"],
    punctuation: velocity["punctuation"],
  };

  languages.insertBefore("velocity", "comment", {
    unparsed: {
      pattern: /(^|[^\\])#\[\[[\s\S]*?\]\]#/,
      lookbehind: true,
      greedy: true,
      inside: {
        punctuation: /^#\[\[|\]\]#$/,
      },
    },
    "velocity-comment": [
      {
        pattern: /(^|[^\\])#\*[\s\S]*?\*#/,
        lookbehind: true,
        greedy: true,
        alias: "comment",
      },
      {
        pattern: /(^|[^\\])##.*/,
        lookbehind: true,
        greedy: true,
        alias: "comment",
      },
    ],
    directive: {
      pattern:
        /(^|[^\\](?:\\\\)*)#@?(?:[a-z][\w-]*|\{[a-z][\w-]*\})(?:\s*\((?:[^()]|\([^()]*\))*\))?/i,
      lookbehind: true,
      inside: {
        keyword: {
          pattern: /^#@?(?:[a-z][\w-]*|\{[a-z][\w-]*\})|\bin\b/,
          inside: {
            punctuation: /[{}]/,
          },
        },
        rest: velocity,
      },
    },
    variable: velocity["variable"],
  });

  languages.velocity["tag"].inside["attr-value"].inside.rest =
    languages.velocity;
})(Prism);
