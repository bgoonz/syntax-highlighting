(({ languages }) => {
  const typeExpression = /(?:\b[a-zA-Z]\w*|[|\\[\]])+/.source;

  languages.phpdoc = languages.extend("javadoclike", {
    parameter: {
      pattern: RegExp(
        `(@(?:global|param|property(?:-read|-write)?|var)\\s+(?:${typeExpression}\\s+)?)\\$\\w+`
      ),
      lookbehind: true,
    },
  });

  languages.insertBefore("phpdoc", "keyword", {
    "class-name": [
      {
        pattern: RegExp(
          `(@(?:global|package|param|property(?:-read|-write)?|return|subpackage|throws|var)\\s+)${typeExpression}`
        ),
        lookbehind: true,
        inside: {
          keyword:
            /\b(?:array|bool|boolean|callback|double|false|float|int|integer|mixed|null|object|resource|self|string|true|void)\b/,
          punctuation: /[|\\[\]()]/,
        },
      },
    ],
  });

  languages.javadoclike.addSupport("php", languages.phpdoc);
})(Prism);
