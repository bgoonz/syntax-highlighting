(({ languages }) => {
  const codeLinePattern = /(^(?:[\t ]*(?:\*\s*)*))[^*\s].*$/m;

  const memberReference = /#\s*\w+(?:\s*\([^()]*\))?/.source;
  const reference =
    /(?:\b[a-zA-Z]\w+\s*\.\s*)*\b[A-Z]\w*(?:\s*<mem>)?|<mem>/.source.replace(
      /<mem>/g,
      () => {
        return memberReference;
      }
    );

  languages.javadoc = languages.extend("javadoclike", {});
  languages.insertBefore("javadoc", "keyword", {
    reference: {
      pattern: RegExp(
        `${
          /(@(?:exception|link|linkplain|see|throws|value)\s+(?:\*\s*)?)/.source
        }(?:${reference})`
      ),
      lookbehind: true,
      inside: {
        function: {
          pattern: /(#\s*)\w+(?=\s*\()/,
          lookbehind: true,
        },
        field: {
          pattern: /(#\s*)\w+/,
          lookbehind: true,
        },
        namespace: {
          pattern: /\b(?:[a-z]\w*\s*\.\s*)+/,
          inside: {
            punctuation: /\./,
          },
        },
        "class-name": /\b[A-Z]\w*/,
        keyword: languages.java.keyword,
        punctuation: /[#()[\],.]/,
      },
    },
    "class-name": {
      // @param <T> the first generic type parameter
      pattern: /(@param\s+)<[A-Z]\w*>/,
      lookbehind: true,
      inside: {
        punctuation: /[.<>]/,
      },
    },
    "code-section": [
      {
        pattern:
          /(\{@code\s+(?!\s))(?:[^\s{}]|\s+(?![\s}])|\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\})+(?=\s*\})/,
        lookbehind: true,
        inside: {
          code: {
            // there can't be any HTML inside of {@code} tags
            pattern: codeLinePattern,
            lookbehind: true,
            inside: languages.java,
            alias: "language-java",
          },
        },
      },
      {
        pattern: /(<(code|pre|tt)>(?!<code>)\s*)\S(?:\S|\s+\S)*?(?=\s*<\/\2>)/,
        lookbehind: true,
        inside: {
          line: {
            pattern: codeLinePattern,
            lookbehind: true,
            inside: {
              // highlight HTML tags and entities
              tag: languages.markup.tag,
              entity: languages.markup.entity,
              code: {
                // everything else is Java code
                pattern: /.+/,
                inside: languages.java,
                alias: "language-java",
              },
            },
          },
        },
      },
    ],
    tag: languages.markup.tag,
    entity: languages.markup.entity,
  });

  languages.javadoclike.addSupport("java", languages.javadoc);
})(Prism);
