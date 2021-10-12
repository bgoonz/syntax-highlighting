(Prism => {
  /**
   * Returns the placeholder for the given language id and index.
   *
   * @param {string} language
   * @param {string|number} index
   * @returns {string}
   */
  function getPlaceholder(language, index) {
    return `___${language.toUpperCase()}${index}___`;
  }

  Object.defineProperties((Prism.languages["markup-templating"] = {}), {
    buildPlaceholders: {
      /**
       * Tokenize all inline templating expressions matching `placeholderPattern`.
       *
       * If `replaceFilter` is provided, only matches of `placeholderPattern` for which `replaceFilter` returns
       * `true` will be replaced.
       *
       * @param {object} env The environment of the `before-tokenize` hook.
       * @param {string} language The language id.
       * @param {RegExp} placeholderPattern The matches of this pattern will be replaced by placeholders.
       * @param {(match: string) => boolean} [replaceFilter]
       */
      value(env, language, placeholderPattern, replaceFilter) {
        if (env.language !== language) {
          return;
        }

        const tokenStack = (env.tokenStack = []);

        env.code = env.code.replace(placeholderPattern, match => {
          if (typeof replaceFilter === "function" && !replaceFilter(match)) {
            return match;
          }
          let i = tokenStack.length;
          let placeholder;

          // Check for existing strings
          while (
            env.code.indexOf((placeholder = getPlaceholder(language, i))) !== -1
          ) {
            ++i;
          }

          // Create a sparse array
          tokenStack[i] = match;

          return placeholder;
        });

        // Switch the grammar to markup
        env.grammar = Prism.languages.markup;
      },
    },
    tokenizePlaceholders: {
      /**
       * Replace placeholders with proper tokens after tokenizing.
       *
       * @param {object} env The environment of the `after-tokenize` hook.
       * @param {string} language The language id.
       */
      value(env, language) {
        if (env.language !== language || !env.tokenStack) {
          return;
        }

        // Switch the grammar back
        env.grammar = Prism.languages[language];

        let j = 0;
        const keys = Object.keys(env.tokenStack);

        function walkTokens(tokens) {
          for (let i = 0; i < tokens.length; i++) {
            // all placeholders are replaced already
            if (j >= keys.length) {
              break;
            }

            const token = tokens[i];
            if (
              typeof token === "string" ||
              (token.content && typeof token.content === "string")
            ) {
              const k = keys[j];
              const t = env.tokenStack[k];
              const s = typeof token === "string" ? token : token.content;
              const placeholder = getPlaceholder(language, k);

              const index = s.indexOf(placeholder);
              if (index > -1) {
                ++j;

                const before = s.substring(0, index);
                const middle = new Prism.Token(
                  language,
                  Prism.tokenize(t, env.grammar),
                  `language-${language}`,
                  t
                );
                const after = s.substring(index + placeholder.length);

                const replacement = [];
                if (before) {
                  replacement.push(...walkTokens([before]));
                }
                replacement.push(middle);
                if (after) {
                  replacement.push(...walkTokens([after]));
                }

                if (typeof token === "string") {
                  tokens.splice(...[i, 1].concat(replacement));
                } else {
                  token.content = replacement;
                }
              }
            } else if (
              token.content /* && typeof token.content !== 'string' */
            ) {
              walkTokens(token.content);
            }
          }

          return tokens;
        }

        walkTokens(env.tokens);
      },
    },
  });
})(Prism);
