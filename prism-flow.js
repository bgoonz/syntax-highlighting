(({ languages }) => {
  languages.flow = languages.extend("javascript", {});

  languages.insertBefore("flow", "keyword", {
    type: [
      {
        pattern:
          /\b(?:[Bb]oolean|Function|[Nn]umber|[Ss]tring|any|mixed|null|void)\b/,
        alias: "tag",
      },
    ],
  });
  languages.flow["function-variable"].pattern =
    /(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=\s*(?:function\b|(?:\([^()]*\)(?:\s*:\s*\w+)?|(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/i;
  delete languages.flow["parameter"];

  languages.insertBefore("flow", "operator", {
    "flow-punctuation": {
      pattern: /\{\||\|\}/,
      alias: "punctuation",
    },
  });

  if (!Array.isArray(languages.flow.keyword)) {
    languages.flow.keyword = [languages.flow.keyword];
  }
  languages.flow.keyword.unshift(
    {
      pattern: /(^|[^$]\b)(?:Class|declare|opaque|type)\b(?!\$)/,
      lookbehind: true,
    },
    {
      pattern:
        /(^|[^$]\B)\$(?:Diff|Enum|Exact|Keys|ObjMap|PropertyType|Record|Shape|Subtype|Supertype|await)\b(?!\$)/,
      lookbehind: true,
    }
  );
})(Prism);
