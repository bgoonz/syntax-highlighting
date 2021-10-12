(({languages, hooks}) => {
  languages.ejs = {
    delimiter: {
      pattern: /^<%[-_=]?|[-_]?%>$/,
      alias: "punctuation",
    },
    comment: /^#[\s\S]*/,
    "language-javascript": {
      pattern: /[\s\S]+/,
      inside: languages.javascript,
    },
  };

  hooks.add("before-tokenize", env => {
    const ejsPattern = /<%(?!%)[\s\S]+?%>/g;
    languages["markup-templating"].buildPlaceholders(
      env,
      "ejs",
      ejsPattern
    );
  });

  hooks.add("after-tokenize", env => {
    languages["markup-templating"].tokenizePlaceholders(env, "ejs");
  });

  languages.eta = languages.ejs;
})(Prism);
