Prism.languages.bro = {
  comment: {
    pattern: /(^|[^\\$])#.*/,
    lookbehind: true,
    inside: {
      italic: /\b(?:FIXME|TODO|XXX)\b/,
    },
  },

  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true,
  },

  boolean: /\b[TF]\b/,

  function: {
    pattern: /(?:event|function|hook) \w+(?:::\w+)?/,
    inside: {
      keyword: /^(?:event|function|hook)/,
    },
  },

  variable: {
    pattern: /(?:global|local) \w+/i,
    inside: {
      keyword: /(?:global|local)/,
    },
  },

  builtin:
    /(?:@(?:load(?:-(?:plugin|sigs))?|unload|prefixes|ifn?def|else|(?:end)?if|DIR|FILENAME))|(?:&?(?:add_func|create_expire|default|delete_func|encrypt|error_handler|expire_func|group|log|mergeable|optional|persistent|priority|raw_output|read_expire|redef|rotate_interval|rotate_size|synchronized|type_column|write_expire))/,

  constant: {
    pattern: /const \w+/i,
    inside: {
      keyword: /const/,
    },
  },

  keyword:
    /\b(?:add|addr|alarm|any|bool|break|continue|count|delete|double|else|enum|export|file|for|function|if|in|int|interval|module|next|of|opaque|pattern|port|print|record|return|schedule|set|string|subnet|table|time|timeout|using|vector|when)\b/,

  operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&|\|\|?|\?|\*|\/|~|\^|%/,

  number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,

  punctuation: /[{}[\];(),.:]/,
};
