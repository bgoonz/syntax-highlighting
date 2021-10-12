(({ languages, hooks }) => {
  languages.latte = {
    comment: /^\{\*[\s\S]*/,
    ld: {
      pattern: /^\{(?:[=_]|\/?(?!\d|\w+\()\w+)?/,
      inside: {
        punctuation: /^\{\/?/,
        tag: {
          pattern: /.+/,
          alias: "important",
        },
      },
    },
    rd: {
      pattern: /\}$/,
      inside: {
        punctuation: /.+/,
      },
    },
    php: {
      pattern: /\S(?:[\s\S]*\S)?/,
      alias: "language-php",
      inside: languages.php,
    },
  };

  const markupLatte = languages.extend("markup", {});
  languages.insertBefore(
    "inside",
    "attr-value",
    {
      "n-attr": {
        pattern: /n:[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+))?/,
        inside: {
          "attr-name": {
            pattern: /^[^\s=]+/,
            alias: "important",
          },
          "attr-value": {
            pattern: /=[\s\S]+/,
            inside: {
              punctuation: [
                /^=/,
                {
                  pattern: /^(\s*)["']|["']$/,
                  lookbehind: true,
                },
              ],
              php: {
                pattern: /\S(?:[\s\S]*\S)?/,
                inside: languages.php,
              },
            },
          },
        },
      },
    },
    markupLatte.tag
  );

  hooks.add("before-tokenize", (env) => {
    if (env.language !== "latte") {
      return;
    }
    const lattePattern =
      /\{\*[\s\S]*?\*\}|\{[^'"\s{}*](?:[^"'/{}]|\/(?![*/])|("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|\/\*(?:[^*]|\*(?!\/))*\*\/)*\}/g;
    languages["markup-templating"].buildPlaceholders(
      env,
      "latte",
      lattePattern
    );
    env.grammar = markupLatte;
  });

  hooks.add("after-tokenize", (env) => {
    languages["markup-templating"].tokenizePlaceholders(env, "latte");
  });
})(Prism);
