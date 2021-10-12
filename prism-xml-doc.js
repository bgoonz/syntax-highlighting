(({languages}) => {
  /**
   * If the given language is present, it will insert the given doc comment grammar token into it.
   *
   * @param {string} lang
   * @param {any} docComment
   */
  function insertDocComment(lang, docComment) {
    if (languages[lang]) {
      languages.insertBefore(lang, "comment", {
        "doc-comment": docComment,
      });
    }
  }

  const tag = languages.markup.tag;

  const slashDocComment = {
    pattern: /\/\/\/.*/,
    greedy: true,
    alias: "comment",
    inside: {
      tag: tag,
    },
  };
  const tickDocComment = {
    pattern: /'''.*/,
    greedy: true,
    alias: "comment",
    inside: {
      tag: tag,
    },
  };

  insertDocComment("csharp", slashDocComment);
  insertDocComment("fsharp", slashDocComment);
  insertDocComment("vbnet", tickDocComment);
})(Prism);
