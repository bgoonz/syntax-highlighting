(({ util, languages, Token, hooks }) => {
  const javascript = util.clone(languages.javascript);

  const space = /(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)/.source;
  const braces = /(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source;
  let spread = /(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/.source;

  /**
   * @param {string} source
   * @param {string} [flags]
   */
  function re(source, flags) {
    source = source
      .replace(/<S>/g, () => {
        return space;
      })
      .replace(/<BRACES>/g, () => {
        return braces;
      })
      .replace(/<SPREAD>/g, () => {
        return spread;
      });
    return RegExp(source, flags);
  }

  spread = re(spread).source;

  languages.jsx = languages.extend("markup", javascript);
  languages.jsx.tag.pattern = re(
    /<\/?(?:[\w.:-]+(?:<S>+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"/>=]+|<BRACES>))?|<SPREAD>))*<S>*\/?)?>/
      .source
  );

  languages.jsx.tag.inside["tag"].pattern = /^<\/?[^\s>\/]*/i;
  languages.jsx.tag.inside["attr-value"].pattern =
    /=(?!\{)(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s'">]+)/i;
  languages.jsx.tag.inside["tag"].inside["class-name"] =
    /^[A-Z]\w*(?:\.[A-Z]\w*)*$/;
  languages.jsx.tag.inside["comment"] = javascript["comment"];

  languages.insertBefore(
    "inside",
    "attr-name",
    {
      spread: {
        pattern: re(/<SPREAD>/.source),
        inside: languages.jsx,
      },
    },
    languages.jsx.tag
  );

  languages.insertBefore(
    "inside",
    "special-attr",
    {
      script: {
        // Allow for two levels of nesting
        pattern: re(/=<BRACES>/.source),
        inside: {
          "script-punctuation": {
            pattern: /^=(?=\{)/,
            alias: "punctuation",
          },
          rest: languages.jsx,
        },
        alias: "language-javascript",
      },
    },
    languages.jsx.tag
  );

  // The following will handle plain text inside tags
  const stringifyToken = (token) => {
    if (!token) {
      return "";
    }
    if (typeof token === "string") {
      return token;
    }
    if (typeof token.content === "string") {
      return token.content;
    }
    return token.content.map(stringifyToken).join("");
  };

  const walkTokens = (tokens) => {
    const openedTags = [];

    tokens.forEach((token, i) => {
      let notTagNorBrace = false;

      if (typeof token !== "string") {
        if (
          token.type === "tag" &&
          token.content[0] &&
          token.content[0].type === "tag"
        ) {
          // We found a tag, now find its kind

          if (token.content[0].content[0].content === "</") {
            // Closing tag
            if (
              openedTags.length > 0 &&
              openedTags[openedTags.length - 1].tagName ===
                stringifyToken(token.content[0].content[1])
            ) {
              // Pop matching opening tag
              openedTags.pop();
            }
          } else {
            if (token.content[token.content.length - 1].content === "/>") {
              // Autoclosed tag, ignore
            } else {
              // Opening tag
              openedTags.push({
                tagName: stringifyToken(token.content[0].content[1]),
                openedBraces: 0,
              });
            }
          }
        } else if (
          openedTags.length > 0 &&
          token.type === "punctuation" &&
          token.content === "{"
        ) {
          // Here we might have entered a JSX context inside a tag
          openedTags[openedTags.length - 1].openedBraces++;
        } else if (
          openedTags.length > 0 &&
          openedTags[openedTags.length - 1].openedBraces > 0 &&
          token.type === "punctuation" &&
          token.content === "}"
        ) {
          // Here we might have left a JSX context inside a tag
          openedTags[openedTags.length - 1].openedBraces--;
        } else {
          notTagNorBrace = true;
        }
      }
      if (notTagNorBrace || typeof token === "string") {
        if (
          openedTags.length > 0 &&
          openedTags[openedTags.length - 1].openedBraces === 0
        ) {
          // Here we are inside a tag, and not inside a JSX context.
          // That's plain text: drop any tokens matched.
          let plainText = stringifyToken(token);

          // And merge text with adjacent text
          if (
            i < tokens.length - 1 &&
            (typeof tokens[i + 1] === "string" ||
              tokens[i + 1].type === "plain-text")
          ) {
            plainText += stringifyToken(tokens[i + 1]);
            tokens.splice(i + 1, 1);
          }
          if (
            i > 0 &&
            (typeof tokens[i - 1] === "string" ||
              tokens[i - 1].type === "plain-text")
          ) {
            plainText = stringifyToken(tokens[i - 1]) + plainText;
            tokens.splice(i - 1, 1);
            i--;
          }

          tokens[i] = new Token("plain-text", plainText, null, plainText);
        }
      }

      if (token.content && typeof token.content !== "string") {
        walkTokens(token.content);
      }
    });
  };

  hooks.add("after-tokenize", ({ language, tokens }) => {
    if (language !== "jsx" && language !== "tsx") {
      return;
    }
    walkTokens(tokens);
  });
})(Prism);
