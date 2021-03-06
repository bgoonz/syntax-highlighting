/* TODO
	Add support for variables inside double quoted strings
	Add support for {php}
*/

(({ languages, hooks }) => {
  languages.smarty = {
    comment: /\{\*[\s\S]*?\*\}/,
    delimiter: {
      pattern: /^\{|\}$/i,
      alias: "punctuation",
    },
    string: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
    number: /\b0x[\dA-Fa-f]+|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][-+]?\d+)?/,
    variable: [
      /\$(?!\d)\w+/,
      /#(?!\d)\w+#/,
      {
        pattern: /(\.|->)(?!\d)\w+/,
        lookbehind: true,
      },
      {
        pattern: /(\[)(?!\d)\w+(?=\])/,
        lookbehind: true,
      },
    ],
    function: [
      {
        pattern: /(\|\s*)@?(?!\d)\w+/,
        lookbehind: true,
      },
      /^\/?(?!\d)\w+/,
      /(?!\d)\w+(?=\()/,
    ],
    "attr-name": {
      // Value is made optional because it may have already been tokenized
      pattern: /\w+\s*=\s*(?:(?!\d)\w+)?/,
      inside: {
        variable: {
          pattern: /(=\s*)(?!\d)\w+/,
          lookbehind: true,
        },
        operator: /=/,
      },
    },
    punctuation: [/[\[\]().,:`]|->/],
    operator: [
      /[+\-*\/%]|==?=?|[!<>]=?|&&|\|\|?/,
      /\bis\s+(?:not\s+)?(?:div|even|odd)(?:\s+by)?\b/,
      /\b(?:and|eq|gt?e|gt|lt?e|lt|mod|neq?|not|or)\b/,
    ],
    keyword: /\b(?:false|no|off|on|true|yes)\b/,
  };

  // Tokenize all inline Smarty expressions
  hooks.add("before-tokenize", (env) => {
    const smartyPattern = /\{\*[\s\S]*?\*\}|\{[\s\S]+?\}/g;
    const smartyLitteralStart = "{literal}";
    const smartyLitteralEnd = "{/literal}";
    let smartyLitteralMode = false;

    languages["markup-templating"].buildPlaceholders(
      env,
      "smarty",
      smartyPattern,
      (match) => {
        // Smarty tags inside {literal} block are ignored
        if (match === smartyLitteralEnd) {
          smartyLitteralMode = false;
        }

        if (!smartyLitteralMode) {
          if (match === smartyLitteralStart) {
            smartyLitteralMode = true;
          }

          return true;
        }
        return false;
      }
    );
  });

  // Re-insert the tokens after tokenizing
  hooks.add("after-tokenize", (env) => {
    languages["markup-templating"].tokenizePlaceholders(env, "smarty");
  });
})(Prism);
