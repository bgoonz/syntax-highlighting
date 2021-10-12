(({languages, hooks}) => {
  const stringPattern = /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;
  const numberPattern = /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\b0x[\dA-F]+\b/;

  languages.soy = {
    comment: [
      /\/\*[\s\S]*?\*\//,
      {
        pattern: /(\s)\/\/.*/,
        lookbehind: true,
        greedy: true,
      },
    ],
    "command-arg": {
      pattern:
        /(\{+\/?\s*(?:alias|call|delcall|delpackage|deltemplate|namespace|template)\s+)\.?[\w.]+/,
      lookbehind: true,
      alias: "string",
      inside: {
        punctuation: /\./,
      },
    },
    parameter: {
      pattern: /(\{+\/?\s*@?param\??\s+)\.?[\w.]+/,
      lookbehind: true,
      alias: "variable",
    },
    keyword: [
      {
        pattern:
          /(\{+\/?[^\S\r\n]*)(?:\\[nrt]|alias|call|case|css|default|delcall|delpackage|deltemplate|else(?:if)?|fallbackmsg|for(?:each)?|if(?:empty)?|lb|let|literal|msg|namespace|nil|@?param\??|rb|sp|switch|template|xid)/,
        lookbehind: true,
      },
      /\b(?:any|as|attributes|bool|css|float|html|in|int|js|list|map|null|number|string|uri)\b/,
    ],
    delimiter: {
      pattern: /^\{+\/?|\/?\}+$/,
      alias: "punctuation",
    },
    property: /\w+(?==)/,
    variable: {
      pattern: /\$[^\W\d]\w*(?:\??(?:\.\w+|\[[^\]]+\]))*/,
      inside: {
        string: {
          pattern: stringPattern,
          greedy: true,
        },
        number: numberPattern,
        punctuation: /[\[\].?]/,
      },
    },
    string: {
      pattern: stringPattern,
      greedy: true,
    },
    function: [
      /\w+(?=\()/,
      {
        pattern: /(\|[^\S\r\n]*)\w+/,
        lookbehind: true,
      },
    ],
    boolean: /\b(?:false|true)\b/,
    number: numberPattern,
    operator: /\?:?|<=?|>=?|==?|!=|[+*/%-]|\b(?:and|not|or)\b/,
    punctuation: /[{}()\[\]|.,:]/,
  };

  // Tokenize all inline Soy expressions
  hooks.add("before-tokenize", env => {
    const soyPattern = /\{\{.+?\}\}|\{.+?\}|\s\/\/.*|\/\*[\s\S]*?\*\//g;
    const soyLitteralStart = "{literal}";
    const soyLitteralEnd = "{/literal}";
    let soyLitteralMode = false;

    languages["markup-templating"].buildPlaceholders(
      env,
      "soy",
      soyPattern,
      match => {
        // Soy tags inside {literal} block are ignored
        if (match === soyLitteralEnd) {
          soyLitteralMode = false;
        }

        if (!soyLitteralMode) {
          if (match === soyLitteralStart) {
            soyLitteralMode = true;
          }

          return true;
        }
        return false;
      }
    );
  });

  // Re-insert the tokens after tokenizing
  hooks.add("after-tokenize", env => {
    languages["markup-templating"].tokenizePlaceholders(env, "soy");
  });
})(Prism);
