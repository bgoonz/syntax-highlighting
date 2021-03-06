(({ languages }) => {
  const keywords = [
    /\b(?:async|sync|yield)\*/,
    /\b(?:abstract|assert|async|await|break|case|catch|class|const|continue|covariant|default|deferred|do|dynamic|else|enum|export|extends|extension|external|factory|final|finally|for|get|hide|if|implements|import|in|interface|library|mixin|new|null|on|operator|part|rethrow|return|set|show|static|super|switch|sync|this|throw|try|typedef|var|void|while|with|yield)\b/,
  ];

  // Handles named imports, such as http.Client
  const packagePrefix = /(^|[^\w.])(?:[a-z]\w*\s*\.\s*)*(?:[A-Z]\w*\s*\.\s*)*/
    .source;

  // based on the dart naming conventions
  const className = {
    pattern: RegExp(packagePrefix + /[A-Z](?:[\d_A-Z]*[a-z]\w*)?\b/.source),
    lookbehind: true,
    inside: {
      namespace: {
        pattern: /^[a-z]\w*(?:\s*\.\s*[a-z]\w*)*(?:\s*\.)?/,
        inside: {
          punctuation: /\./,
        },
      },
    },
  };

  languages.dart = languages.extend("clike", {
    string: [
      {
        pattern: /r?("""|''')[\s\S]*?\1/,
        greedy: true,
      },
      {
        pattern: /r?(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
        greedy: true,
      },
    ],
    "class-name": [
      className,
      {
        // variables and parameters
        // this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
        pattern: RegExp(packagePrefix + /[A-Z]\w*(?=\s+\w+\s*[;,=()])/.source),
        lookbehind: true,
        inside: className.inside,
      },
    ],
    keyword: keywords,
    operator:
      /\bis!|\b(?:as|is)\b|\+\+|--|&&|\|\||<<=?|>>=?|~(?:\/=?)?|[+\-*\/%&^|=!<>]=?|\?/,
  });

  languages.insertBefore("dart", "function", {
    metadata: {
      pattern: /@\w+/,
      alias: "symbol",
    },
  });

  languages.insertBefore("dart", "class-name", {
    generics: {
      pattern:
        /<(?:[\w\s,.&?]|<(?:[\w\s,.&?]|<(?:[\w\s,.&?]|<[\w\s,.&?]*>)*>)*>)*>/,
      inside: {
        "class-name": className,
        keyword: keywords,
        punctuation: /[<>(),.:]/,
        operator: /[?&|]/,
      },
    },
  });
})(Prism);
