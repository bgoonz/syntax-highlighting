(({ languages }) => {
  const jsString = /"(?:\\.|[^\\"\r\n])*"|'(?:\\.|[^\\'\r\n])*'/.source;
  const jsComment = /\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\//.source;

  let jsExpr =
    /(?:[^\\()[\]{}"'/]|<string>|\/(?![*/])|<comment>|\(<expr>*\)|\[<expr>*\]|\{<expr>*\}|\\[\s\S])/.source
      .replace(/<string>/g, () => {
        return jsString;
      })
      .replace(/<comment>/g, () => {
        return jsComment;
      });

  // the pattern will blow up, so only a few iterations
  for (let i = 0; i < 2; i++) {
    jsExpr = jsExpr.replace(/<expr>/g, () => {
      return jsExpr;
    });
  }
  jsExpr = jsExpr.replace(/<expr>/g, "[^\\s\\S]");

  languages.qml = {
    comment: {
      pattern: /\/\/.*|\/\*[\s\S]*?\*\//,
      greedy: true,
    },
    "javascript-function": {
      pattern: RegExp(
        /((?:^|;)[ \t]*)function\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*\(<js>*\)\s*\{<js>*\}/.source.replace(
          /<js>/g,
          () => {
            return jsExpr;
          }
        ),
        "m"
      ),
      lookbehind: true,
      greedy: true,
      alias: "language-javascript",
      inside: languages.javascript,
    },
    "class-name": {
      pattern: /((?:^|[:;])[ \t]*)(?!\d)\w+(?=[ \t]*\{|[ \t]+on\b)/m,
      lookbehind: true,
    },
    property: [
      {
        pattern: /((?:^|[;{])[ \t]*)(?!\d)\w+(?:\.\w+)*(?=[ \t]*:)/m,
        lookbehind: true,
      },
      {
        pattern:
          /((?:^|[;{])[ \t]*)property[ \t]+(?!\d)\w+(?:\.\w+)*[ \t]+(?!\d)\w+(?:\.\w+)*(?=[ \t]*:)/m,
        lookbehind: true,
        inside: {
          keyword: /^property/,
          property: /\w+(?:\.\w+)*/,
        },
      },
    ],
    "javascript-expression": {
      pattern: RegExp(
        /(:[ \t]*)(?![\s;}[])(?:(?!$|[;}])<js>)+/.source.replace(
          /<js>/g,
          () => {
            return jsExpr;
          }
        ),
        "m"
      ),
      lookbehind: true,
      greedy: true,
      alias: "language-javascript",
      inside: languages.javascript,
    },
    string: /"(?:\\.|[^\\"\r\n])*"/,
    keyword: /\b(?:as|import|on)\b/,
    punctuation: /[{}[\]:;,]/,
  };
})(Prism);
