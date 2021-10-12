// Docs:
// https://docs.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-5.0&tabs=visual-studio
// https://docs.microsoft.com/en-us/aspnet/core/mvc/views/razor?view=aspnetcore-5.0

(Prism => {
  const commentLike = /\/(?![/*])|\/\/.*[\r\n]|\/\*[^*]*(?:\*(?!\/)[^*]*)*\*\//
    .source;
  const stringLike =
    /@(?!")|"(?:[^\r\n\\"]|\\.)*"|@"(?:[^\\"]|""|\\[\s\S])*"(?!")/.source +
    "|" +
    /'(?:(?:[^\r\n'\\]|\\.|\\[Uux][\da-fA-F]{1,8})'|(?=[^\\](?!')))/.source;

  /**
   * Creates a nested pattern where all occurrences of the string `<<self>>` are replaced with the pattern itself.
   *
   * @param {string} pattern
   * @param {number} depthLog2
   * @returns {string}
   */
  function nested(pattern, depthLog2) {
    for (let i = 0; i < depthLog2; i++) {
      pattern = pattern.replace(/<self>/g, () => {
        return "(?:" + pattern + ")";
      });
    }
    return pattern
      .replace(/<self>/g, "[^\\s\\S]")
      .replace(/<str>/g, "(?:" + stringLike + ")")
      .replace(/<comment>/g, "(?:" + commentLike + ")");
  }

  const round = nested(/\((?:[^()'"@/]|<str>|<comment>|<self>)*\)/.source, 2);
  const square = nested(/\[(?:[^\[\]'"@/]|<str>|<comment>|<self>)*\]/.source, 2);
  const curly = nested(/\{(?:[^{}'"@/]|<str>|<comment>|<self>)*\}/.source, 2);
  const angle = nested(/<(?:[^<>'"@/]|<str>|<comment>|<self>)*>/.source, 2);

  // Note about the above bracket patterns:
  // They all ignore HTML expressions that might be in the C# code. This is a problem because HTML (like strings and
  // comments) is parsed differently. This is a huge problem because HTML might contain brackets and quotes which
  // messes up the bracket and string counting implemented by the above patterns.
  //
  // This problem is not fixable because 1) HTML expression are highly context sensitive and very difficult to detect
  // and 2) they require one capturing group at every nested level. See the `tagRegion` pattern to admire the
  // complexity of an HTML expression.
  //
  // To somewhat alleviate the problem a bit, the patterns for characters (e.g. 'a') is very permissive, it also
  // allows invalid characters to support HTML expressions like this: <p>That's it!</p>.

  const tagAttrs =
    /(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?/
      .source;
  const tagContent = /(?!\d)[^\s>\/=$<%]+/.source + tagAttrs + /\s*\/?>/.source;
  const tagRegion =
    /\B@?/.source +
    "(?:" +
    /<([a-zA-Z][\w:]*)/.source +
    tagAttrs +
    /\s*>/.source +
    "(?:" +
    (/[^<]/.source +
      "|" +
      // all tags that are not the start tag
      // eslint-disable-next-line regexp/strict
      /<\/?(?!\1\b)/.source +
      tagContent +
      "|" +
      // nested start tag
      nested(
        // eslint-disable-next-line regexp/strict
        /<\1/.source +
          tagAttrs +
          /\s*>/.source +
          "(?:" +
          (/[^<]/.source +
            "|" +
            // all tags that are not the start tag
            // eslint-disable-next-line regexp/strict
            /<\/?(?!\1\b)/.source +
            tagContent +
            "|" +
            "<self>") +
          ")*" +
          // eslint-disable-next-line regexp/strict
          /<\/\1\s*>/.source,
        2
      )) +
    ")*" +
    // eslint-disable-next-line regexp/strict
    /<\/\1\s*>/.source +
    "|" +
    /</.source +
    tagContent +
    ")";

  // Now for the actual language definition(s):
  //
  // Razor as a language has 2 parts:
  //  1) CSHTML: A markup-like language that has been extended with inline C# code expressions and blocks.
  //  2) C#+HTML: A variant of C# that can contain CSHTML tags as expressions.
  //
  // In the below code, both CSHTML and C#+HTML will be create as separate language definitions that reference each
  // other. However, only CSHTML will be exported via `Prism.languages`.

  Prism.languages.cshtml = Prism.languages.extend("markup", {});

  const csharpWithHtml = Prism.languages.insertBefore(
    "csharp",
    "string",
    {
      html: {
        pattern: RegExp(tagRegion),
        greedy: true,
        inside: Prism.languages.cshtml,
      },
    },
    { csharp: Prism.languages.extend("csharp", {}) }
  );

  const cs = {
    pattern: /\S[\s\S]*/,
    alias: "language-csharp",
    inside: csharpWithHtml,
  };

  Prism.languages.insertBefore("cshtml", "prolog", {
    "razor-comment": {
      pattern: /@\*[\s\S]*?\*@/,
      greedy: true,
      alias: "comment",
    },

    block: {
      pattern: RegExp(
        /(^|[^@])@/.source +
          "(?:" +
          [
            // @{ ... }
            curly,
            // @code{ ... }
            /(?:code|functions)\s*/.source + curly,
            // @for (...) { ... }
            /(?:for|foreach|lock|switch|using|while)\s*/.source +
              round +
              /\s*/.source +
              curly,
            // @do { ... } while (...);
            /do\s*/.source +
              curly +
              /\s*while\s*/.source +
              round +
              /(?:\s*;)?/.source,
            // @try { ... } catch (...) { ... } finally { ... }
            /try\s*/.source +
              curly +
              /\s*catch\s*/.source +
              round +
              /\s*/.source +
              curly +
              /\s*finally\s*/.source +
              curly,
            // @if (...) {...} else if (...) {...} else {...}
            /if\s*/.source +
              round +
              /\s*/.source +
              curly +
              "(?:" +
              /\s*else/.source +
              "(?:" +
              /\s+if\s*/.source +
              round +
              ")?" +
              /\s*/.source +
              curly +
              ")*",
          ].join("|") +
          ")"
      ),
      lookbehind: true,
      greedy: true,
      inside: {
        keyword: /^@\w*/,
        csharp: cs,
      },
    },

    directive: {
      pattern:
        /^([ \t]*)@(?:addTagHelper|attribute|implements|inherits|inject|layout|model|namespace|page|preservewhitespace|removeTagHelper|section|tagHelperPrefix|using)(?=\s).*/m,
      lookbehind: true,
      greedy: true,
      inside: {
        keyword: /^@\w+/,
        csharp: cs,
      },
    },

    value: {
      pattern: RegExp(
        /(^|[^@])@/.source +
          /(?:await\b\s*)?/.source +
          "(?:" +
          /\w+\b/.source +
          "|" +
          round +
          ")" +
          "(?:" +
          /[?!]?\.\w+\b/.source +
          "|" +
          round +
          "|" +
          square +
          "|" +
          angle +
          round +
          ")*"
      ),
      lookbehind: true,
      greedy: true,
      alias: "variable",
      inside: {
        keyword: /^@/,
        csharp: cs,
      },
    },

    "delegate-operator": {
      pattern: /(^|[^@])@(?=<)/,
      lookbehind: true,
      alias: "operator",
    },
  });

  Prism.languages.razor = Prism.languages.cshtml;
})(Prism);
