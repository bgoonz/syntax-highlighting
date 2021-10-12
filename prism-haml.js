/* TODO
	Handle multiline code after tag
	    %foo= some |
			multiline |
			code |
*/

(({ languages }) => {
  languages.haml = {
    // Multiline stuff should appear before the rest

    "multiline-comment": {
      pattern: /((?:^|\r?\n|\r)([\t ]*))(?:\/|-#).*(?:(?:\r?\n|\r)\2[\t ].+)*/,
      lookbehind: true,
      alias: "comment",
    },

    "multiline-code": [
      {
        pattern:
          /((?:^|\r?\n|\r)([\t ]*)(?:[~-]|[&!]?=)).*,[\t ]*(?:(?:\r?\n|\r)\2[\t ].*,[\t ]*)*(?:(?:\r?\n|\r)\2[\t ].+)/,
        lookbehind: true,
        inside: languages.ruby,
      },
      {
        pattern:
          /((?:^|\r?\n|\r)([\t ]*)(?:[~-]|[&!]?=)).*\|[\t ]*(?:(?:\r?\n|\r)\2[\t ].*\|[\t ]*)*/,
        lookbehind: true,
        inside: languages.ruby,
      },
    ],

    // See at the end of the file for known filters
    filter: {
      pattern:
        /((?:^|\r?\n|\r)([\t ]*)):[\w-]+(?:(?:\r?\n|\r)(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/,
      lookbehind: true,
      inside: {
        "filter-name": {
          pattern: /^:[\w-]+/,
          alias: "variable",
        },
      },
    },

    markup: {
      pattern: /((?:^|\r?\n|\r)[\t ]*)<.+/,
      lookbehind: true,
      inside: languages.markup,
    },
    doctype: {
      pattern: /((?:^|\r?\n|\r)[\t ]*)!!!(?: .+)?/,
      lookbehind: true,
    },
    tag: {
      // Allows for one nested group of braces
      pattern:
        /((?:^|\r?\n|\r)[\t ]*)[%.#][\w\-#.]*[\w\-](?:\([^)]+\)|\{(?:\{[^}]+\}|[^{}])+\}|\[[^\]]+\])*[\/<>]*/,
      lookbehind: true,
      inside: {
        attributes: [
          {
            // Lookbehind tries to prevent interpolations from breaking it all
            // Allows for one nested group of braces
            pattern: /(^|[^#])\{(?:\{[^}]+\}|[^{}])+\}/,
            lookbehind: true,
            inside: languages.ruby,
          },
          {
            pattern: /\([^)]+\)/,
            inside: {
              "attr-value": {
                pattern: /(=\s*)(?:"(?:\\.|[^\\"\r\n])*"|[^)\s]+)/,
                lookbehind: true,
              },
              "attr-name": /[\w:-]+(?=\s*!?=|\s*[,)])/,
              punctuation: /[=(),]/,
            },
          },
          {
            pattern: /\[[^\]]+\]/,
            inside: languages.ruby,
          },
        ],
        punctuation: /[<>]/,
      },
    },
    code: {
      pattern: /((?:^|\r?\n|\r)[\t ]*(?:[~-]|[&!]?=)).+/,
      lookbehind: true,
      inside: languages.ruby,
    },
    // Interpolations in plain text
    interpolation: {
      pattern: /#\{[^}]+\}/,
      inside: {
        delimiter: {
          pattern: /^#\{|\}$/,
          alias: "punctuation",
        },
        rest: languages.ruby,
      },
    },
    punctuation: {
      pattern: /((?:^|\r?\n|\r)[\t ]*)[~=\-&!]+/,
      lookbehind: true,
    },
  };

  const filter_pattern =
    "((?:^|\\r?\\n|\\r)([\\t ]*)):{{filter_name}}(?:(?:\\r?\\n|\\r)(?:\\2[\\t ].+|\\s*?(?=\\r?\\n|\\r)))+";

  // Non exhaustive list of available filters and associated languages
  const filters = [
    "css",
    { filter: "coffee", language: "coffeescript" },
    "erb",
    "javascript",
    "less",
    "markdown",
    "ruby",
    "scss",
    "textile",
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
          filter_pattern.replace("{{filter_name}}", () => {
            return filter.filter;
          })
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

  languages.insertBefore("haml", "filter", all_filters);
})(Prism);
