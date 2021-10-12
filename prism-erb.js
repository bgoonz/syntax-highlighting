(({ languages, hooks }) => {
  languages.erb = languages.extend("ruby", {});
  languages.insertBefore("erb", "comment", {
    delimiter: {
      pattern: /^<%=?|%>$/,
      alias: "punctuation",
    },
  });

  hooks.add("before-tokenize", (env) => {
    const erbPattern =
      /<%=?(?:[^\r\n]|[\r\n](?!=begin)|[\r\n]=begin\s(?:[^\r\n]|[\r\n](?!=end))*[\r\n]=end)+?%>/gm;
    languages["markup-templating"].buildPlaceholders(env, "erb", erbPattern);
  });

  hooks.add("after-tokenize", (env) => {
    languages["markup-templating"].tokenizePlaceholders(env, "erb");
  });
})(Prism);
