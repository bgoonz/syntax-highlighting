Prism.languages.jolie = Prism.languages.extend("clike", {
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true,
  },
  keyword:
    /\b(?:Aggregates|Interfaces|Java|Javascript|Jolie|Location|OneWay|Protocol|Redirects|RequestResponse|cH|comp|concurrent|constants|courier|cset|csets|default|define|else|embedded|execution|exit|extender|for|foreach|forward|global|if|in|include|init|inputPort|install|instanceof|interface|is_defined|linkIn|linkOut|main|new|nullProcess|outputPort|over|provide|scope|sequential|service|single|spawn|synchronized|this|throw|throws|type|undef|until|while|with)\b/,
  number: /(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?l?/i,
  operator: /-[-=>]?|\+[+=]?|<[<=]?|[>=*!]=?|&&|\|\||[:?\/%^]/,
  punctuation: /[,.]/,
  builtin:
    /\b(?:Byte|any|bool|char|double|float|int|long|string|undefined|void)\b/,
  symbol: /[|;@]/,
});

delete Prism.languages.jolie["class-name"];

Prism.languages.insertBefore("jolie", "keyword", {
  function: {
    pattern: /((?:\b(?:courier|in|inputPort|outputPort|service)\b|@)\s*)\w+/,
    lookbehind: true,
  },
  aggregates: {
    pattern:
      /(\bAggregates\s*:\s*)(?:\w+(?:\s+with\s+\w+)?\s*,\s*)*\w+(?:\s+with\s+\w+)?/,
    lookbehind: true,
    inside: {
      "with-extension": {
        pattern: /\bwith\s+\w+/,
        inside: {
          keyword: /\bwith\b/,
        },
      },
      function: {
        pattern: /\w+/,
      },
      punctuation: {
        pattern: /,/,
      },
    },
  },
  redirects: {
    pattern: /(\bRedirects\s*:\s*)(?:\w+\s*=>\s*\w+\s*,\s*)*(?:\w+\s*=>\s*\w+)/,
    lookbehind: true,
    inside: {
      punctuation: {
        pattern: /,/,
      },
      function: {
        pattern: /\w+/,
      },
      symbol: {
        pattern: /=>/,
      },
    },
  },
});
