(({ languages }) => {
  languages.http = {
    "request-line": {
      pattern:
        /^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PRI|PUT|SEARCH|TRACE)\s(?:https?:\/\/|\/)\S*\sHTTP\/[\d.]+/m,
      inside: {
        // HTTP Method
        method: {
          pattern: /^[A-Z]+\b/,
          alias: "property",
        },
        // Request Target e.g. http://example.com, /path/to/file
        "request-target": {
          pattern: /^(\s)(?:https?:\/\/|\/)\S*(?=\s)/,
          lookbehind: true,
          alias: "url",
          inside: languages.uri,
        },
        // HTTP Version
        "http-version": {
          pattern: /^(\s)HTTP\/[\d.]+/,
          lookbehind: true,
          alias: "property",
        },
      },
    },
    "response-status": {
      pattern: /^HTTP\/[\d.]+ \d+ .+/m,
      inside: {
        // HTTP Version
        "http-version": {
          pattern: /^HTTP\/[\d.]+/,
          alias: "property",
        },
        // Status Code
        "status-code": {
          pattern: /^(\s)\d+(?=\s)/,
          lookbehind: true,
          alias: "number",
        },
        // Reason Phrase
        "reason-phrase": {
          pattern: /^(\s).+/,
          lookbehind: true,
          alias: "string",
        },
      },
    },
    // HTTP header name
    "header-name": {
      pattern: /^[\w-]+:(?=.)/m,
      alias: "keyword",
    },
  };

  // Create a mapping of Content-Type headers to language definitions
  const langs = languages;
  const httpLanguages = {
    "application/javascript": langs.javascript,
    "application/json": langs.json || langs.javascript,
    "application/xml": langs.xml,
    "text/xml": langs.xml,
    "text/html": langs.html,
    "text/css": langs.css,
  };

  // Declare which types can also be suffixes
  const suffixTypes = {
    "application/json": true,
    "application/xml": true,
  };

  /**
   * Returns a pattern for the given content type which matches it and any type which has it as a suffix.
   *
   * @param {string} contentType
   * @returns {string}
   */
  function getSuffixPattern(contentType) {
    const suffix = contentType.replace(/^[a-z]+\//, "");
    const suffixPattern = `\\w+/(?:[\\w.-]+\\+)+${suffix}(?![+\\w.-])`;
    return `(?:${contentType}|${suffixPattern})`;
  }

  // Insert each content type parser that has its associated language
  // currently loaded.
  let options;
  for (const contentType in httpLanguages) {
    if (httpLanguages[contentType]) {
      options = options || {};

      const pattern = suffixTypes[contentType]
        ? getSuffixPattern(contentType)
        : contentType;
      options[contentType.replace(/\//g, "-")] = {
        pattern: RegExp(
          `(content-type:\\s*${pattern}(?:(?:\\r\\n?|\\n).+)*)(?:\\r?\\n|\\r){2}[\\s\\S]*`,
          "i"
        ),
        lookbehind: true,
        inside: httpLanguages[contentType],
      };
    }
  }
  if (options) {
    languages.insertBefore("http", "header-name", options);
  }
})(Prism);
