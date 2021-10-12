(({languages}) => {
  languages.sass = languages.extend("css", {
    // Sass comments don't need to be closed, only indented
    comment: {
      pattern: /^([ \t]*)\/[\/*].*(?:(?:\r?\n|\r)\1[ \t].+)*/m,
      lookbehind: true,
      greedy: true,
    },
  });

  languages.insertBefore("sass", "atrule", {
    // We want to consume the whole line
    "atrule-line": {
      // Includes support for = and + shortcuts
      pattern: /^(?:[ \t]*)[@+=].+/m,
      greedy: true,
      inside: {
        atrule: /(?:@[\w-]+|[+=])/m,
      },
    },
  });
  delete languages.sass.atrule;

  const variable = /\$[-\w]+|#\{\$[-\w]+\}/;
  const operator = [
    /[+*\/%]|[=!]=|<=?|>=?|\b(?:and|not|or)\b/,
    {
      pattern: /(\s)-(?=\s)/,
      lookbehind: true,
    },
  ];

  languages.insertBefore("sass", "property", {
    // We want to consume the whole line
    "variable-line": {
      pattern: /^[ \t]*\$.+/m,
      greedy: true,
      inside: {
        punctuation: /:/,
        variable: variable,
        operator: operator,
      },
    },
    // We want to consume the whole line
    "property-line": {
      pattern: /^[ \t]*(?:[^:\s]+ *:.*|:[^:\s].*)/m,
      greedy: true,
      inside: {
        property: [
          /[^:\s]+(?=\s*:)/,
          {
            pattern: /(:)[^:\s]+/,
            lookbehind: true,
          },
        ],
        punctuation: /:/,
        variable: variable,
        operator: operator,
        important: languages.sass.important,
      },
    },
  });
  delete languages.sass.property;
  delete languages.sass.important;

  // Now that whole lines for other patterns are consumed,
  // what's left should be selectors
  languages.insertBefore("sass", "punctuation", {
    selector: {
      pattern:
        /^([ \t]*)\S(?:,[^,\r\n]+|[^,\r\n]*)(?:,[^,\r\n]+)*(?:,(?:\r?\n|\r)\1[ \t]+\S(?:,[^,\r\n]+|[^,\r\n]*)(?:,[^,\r\n]+)*)*/m,
      lookbehind: true,
      greedy: true,
    },
  });
})(Prism);
