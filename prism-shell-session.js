(({languages}) => {
  // CAREFUL!
  // The following patterns are concatenated, so the group referenced by a back reference is non-obvious!

  const strings = [
    // normal string
    /"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"/.source,
    /'[^']*'/.source,
    /\$'(?:[^'\\]|\\[\s\S])*'/.source,

    // here doc
    // 2 capturing groups
    /<<-?\s*(["']?)(\w+)\1\s[\s\S]*?[\r\n]\2/.source,
  ].join("|");

  languages["shell-session"] = {
    command: {
      pattern: RegExp(
        // user info
        // <user> ":" ( <path> )?
        // <path>
        // Since the path pattern is quite general, we will require it to start with a special character to
        // prevent false positives.
        // shell symbol
        // bash command
        `${/^/.source}(?:${/[^\s@:$#%*!/\\]+@[^\r\n@:$#%*!/\\]+(?::[^\0-\x1F$#%*?"<>:;|]+)?/
    .source}|${// <path>
// Since the path pattern is quite general, we will require it to start with a special character to
// prevent false positives.
/[/~.][^\0-\x1F$#%*?"<>@:;|]*/.source})?${// shell symbol
/[$#%](?=\s)/.source}${// bash command
/(?:[^\\\r\n \t'"<$]|[ \t](?:(?!#)|#.*$)|\\(?:[^\r]|\r\n?)|\$(?!')|<(?!<)|<<str>>)+/.source.replace(
  /<<str>>/g,
  () => {
    return strings;
  }
)}`,
        "m"
      ),
      greedy: true,
      inside: {
        info: {
          // foo@bar:~/files$ exit
          // foo@bar$ exit
          // ~/files$ exit
          pattern: /^[^#$%]+/,
          alias: "punctuation",
          inside: {
            user: /^[^\s@:$#%*!/\\]+@[^\r\n@:$#%*!/\\]+/,
            punctuation: /:/,
            path: /[\s\S]+/,
          },
        },
        bash: {
          pattern: /(^[$#%]\s*)\S[\s\S]*/,
          lookbehind: true,
          alias: "language-bash",
          inside: languages.bash,
        },
        "shell-symbol": {
          pattern: /^[$#%]/,
          alias: "important",
        },
      },
    },
    output: /.(?:.*(?:[\r\n]|.$))*/,
  };

  languages["sh-session"] = languages["shellsession"] =
    languages["shell-session"];
})(Prism);
