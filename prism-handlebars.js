(Prism => {
  Prism.languages.handlebars = {
    comment: /\{\{![\s\S]*?\}\}/,
    delimiter: {
      pattern: /^\{\{\{?|\}\}\}?$/i,
      alias: "punctuation",
    },
    string: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
    number: /\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][+-]?\d+)?/,
    boolean: /\b(?:false|true)\b/,
    block: {
      pattern: /^(\s*(?:~\s*)?)[#\/]\S+?(?=\s*(?:~\s*)?$|\s)/i,
      lookbehind: true,
      alias: "keyword",
    },
    brackets: {
      pattern: /\[[^\]]+\]/,
      inside: {
        punctuation: /\[|\]/,
        variable: /[\s\S]+/,
      },
    },
    punctuation: /[!"#%&':()*+,.\/;<=>@\[\\\]^`{|}~]/,
    variable: /[^!"#%&'()*+,\/;<=>@\[\\\]^`{|}~\s]+/,
  };

  Prism.hooks.add("before-tokenize", env => {
    const handlebarsPattern = /\{\{\{[\s\S]+?\}\}\}|\{\{[\s\S]+?\}\}/g;
    Prism.languages["markup-templating"].buildPlaceholders(
      env,
      "handlebars",
      handlebarsPattern
    );
  });

  Prism.hooks.add("after-tokenize", env => {
    Prism.languages["markup-templating"].tokenizePlaceholders(
      env,
      "handlebars"
    );
  });

  Prism.languages.hbs = Prism.languages.handlebars;
})(Prism);
