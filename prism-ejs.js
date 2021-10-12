(Prism => {
  Prism.languages.ejs = {
    delimiter: {
      pattern: /^<%[-_=]?|[-_]?%>$/,
      alias: "punctuation",
    },
    comment: /^#[\s\S]*/,
    "language-javascript": {
      pattern: /[\s\S]+/,
      inside: Prism.languages.javascript,
    },
  };

  Prism.hooks.add("before-tokenize", env => {
    const ejsPattern = /<%(?!%)[\s\S]+?%>/g;
    Prism.languages["markup-templating"].buildPlaceholders(
      env,
      "ejs",
      ejsPattern
    );
  });

  Prism.hooks.add("after-tokenize", env => {
    Prism.languages["markup-templating"].tokenizePlaceholders(env, "ejs");
  });

  Prism.languages.eta = Prism.languages.ejs;
})(Prism);
