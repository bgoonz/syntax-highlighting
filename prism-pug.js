(({ languages }) => {
  // TODO:
  // - Add CSS highlighting inside <style> tags
  // - Add support for multi-line code blocks
  // - Add support for interpolation #{} and !{}
  // - Add support for tag interpolation #[]
  // - Add explicit support for plain text using |
  // - Add support for markup embedded in plain text

  languages.pug = {
    // Multiline stuff should appear before the rest

    // This handles both single-line and multi-line comments
    comment: {
      pattern: /(^([\t ]*))\/\/.*(?:(?:\r?\n|\r)\2[\t ].+)*/m,
      lookbehind: true,
    },

    // All the tag-related part is in lookbehind
    // so that it can be highlighted by the "tag" pattern
    "multiline-script": {
      pattern:
        /(^([\t ]*)script\b.*\.[\t ]*)(?:(?:\r?\n|\r(?!\n))(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/m,
      lookbehind: true,
      inside: languages.javascript,
    },

    // See at the end of the file for known filters
    filter: {
      pattern:
        /(^([\t ]*)):.+(?:(?:\r?\n|\r(?!\n))(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/m,
      lookbehind: true,
      inside: {
        "filter-name": {
          pattern: /^:[\w-]+/,
          alias: "variable",
        },
      },
    },

    "multiline-plain-text": {
      pattern:
        /(^([\t ]*)[\w\-#.]+\.[\t ]*)(?:(?:\r?\n|\r(?!\n))(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/m,
      lookbehind: true,
    },
    markup: {
      pattern: /(^[\t ]*)<.+/m,
      lookbehind: true,
      inside: languages.markup,
    },
    doctype: {
      pattern: /((?:^|\n)[\t ]*)doctype(?: .+)?/,
      lookbehind: true,
    },

    // This handle all conditional and loop keywords
    "flow-control": {
      pattern:
        /(^[\t ]*)(?:case|default|each|else|if|unless|when|while)\b(?: .+)?/m,
      lookbehind: true,
      inside: {
        each: {
          pattern: /^each .+? in\b/,
          inside: {
            keyword: /\b(?:each|in)\b/,
            punctuation: /,/,
          },
        },
        branch: {
          pattern: /^(?:case|default|else|if|unless|when|while)\b/,
          alias: "keyword",
        },
        rest: languages.javascript,
      },
    },
    keyword: {
      pattern: /(^[\t ]*)(?:append|block|extends|include|prepend)\b.+/m,
      lookbehind: true,
    },
    mixin: [
      // Declaration
      {
        pattern: /(^[\t ]*)mixin .+/m,
        lookbehind: true,
        inside: {
          keyword: /^mixin/,
          function: /\w+(?=\s*\(|\s*$)/,
          punctuation: /[(),.]/,
        },
      },
      // Usage
      {
        pattern: /(^[\t ]*)\+.+/m,
        lookbehind: true,
        inside: {
          name: {
            pattern: /^\+\w+/,
            alias: "function",
          },
          rest: languages.javascript,
        },
      },
    ],
    script: {
      pattern: /(^[\t ]*script(?:(?:&[^(]+)?\([^)]+\))*[\t ]).+/m,
      lookbehind: true,
      inside: languages.javascript,
    },

    "plain-text": {
      pattern:
        /(^[\t ]*(?!-)[\w\-#.]*[\w\-](?:(?:&[^(]+)?\([^)]+\))*\/?[\t ]).+/m,
      lookbehind: true,
    },
    tag: {
      pattern: /(^[\t ]*)(?!-)[\w\-#.]*[\w\-](?:(?:&[^(]+)?\([^)]+\))*\/?:?/m,
      lookbehind: true,
      inside: {
        attributes: [
          {
            pattern: /&[^(]+\([^)]+\)/,
            inside: languages.javascript,
          },
          {
            pattern: /\([^)]+\)/,
            inside: {
              "attr-value": {
                pattern: /(=\s*(?!\s))(?:\{[^}]*\}|[^,)\r\n]+)/,
                lookbehind: true,
                inside: languages.javascript,
              },
              "attr-name": /[\w-]+(?=\s*!?=|\s*[,)])/,
              punctuation: /[!=(),]+/,
            },
          },
        ],
        punctuation: /:/,
        "attr-id": /#[\w\-]+/,
        "attr-class": /\.[\w\-]+/,
      },
    },
    code: [
      {
        pattern: /(^[\t ]*(?:-|!?=)).+/m,
        lookbehind: true,
        inside: languages.javascript,
      },
    ],
    punctuation: /[.\-!=|]+/,
  };

  const filter_pattern =
    /(^([\t ]*)):<filter_name>(?:(?:\r?\n|\r(?!\n))(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/
      .source;

  // Non exhaustive list of available filters and associated languages
  const filters = [
    { filter: "atpl", language: "twig" },
    { filter: "coffee", language: "coffeescript" },
    "ejs",
    "handlebars",
    "less",
    "livescript",
    "markdown",
    { filter: "sass", language: "scss" },
    "stylus",
  ];
  const all_filters = {};
  for (let i = 0, l = filters.length; i < l; i++) {
    let filter = filters[i];
    filter =
      typeof filter === "string"
        ? { filter: filter, language: filter }
        : filter;
    if (languages[filter.language]) {
      all_filters[`filter-${filter.filter}`] = {
        pattern: RegExp(
          filter_pattern.replace("<filter_name>", () => {
            return filter.filter;
          }),
          "m"
        ),
        lookbehind: true,
        inside: {
          "filter-name": {
            pattern: /^:[\w-]+/,
            alias: "variable",
          },
          rest: languages[filter.language],
        },
      };
    }
  }

  languages.insertBefore("pug", "filter", all_filters);
})(Prism);
