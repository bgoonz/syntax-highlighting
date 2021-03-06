Prism.languages.insertBefore("php", "variable", {
  this: /\$this\b/,
  global:
    /\$(?:GLOBALS|HTTP_RAW_POST_DATA|_(?:COOKIE|ENV|FILES|GET|POST|REQUEST|SERVER|SESSION)|argc|argv|http_response_header|php_errormsg)\b/,
  scope: {
    pattern: /\b[\w\\]+::/,
    inside: {
      keyword: /parent|self|static/,
      punctuation: /::|\\/,
    },
  },
});
