(({ languages, hooks }) => {
  languages.etlua = {
    delimiter: {
      pattern: /^<%[-=]?|-?%>$/,
      alias: "punctuation",
    },
    "language-lua": {
      pattern: /[\s\S]+/,
      inside: languages.lua,
    },
  };

  hooks.add("before-tokenize", (env) => {
    const pattern = /<%[\s\S]+?%>/g;
    languages["markup-templating"].buildPlaceholders(env, "etlua", pattern);
  });

  hooks.add("after-tokenize", (env) => {
    languages["markup-templating"].tokenizePlaceholders(env, "etlua");
  });
})(Prism);
