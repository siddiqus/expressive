module.exports = {
  "env": {
    "browser": true,
    "es6": true,
  },
  "extends": [
    "google",
    "plugin:prettier/recommended"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly",
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true,
    },
    "ecmaVersion": 2018,
    "sourceType": "module",
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "linebreak-style": [
      "error",
      process.platform === "win32" ? "windows" : "unix"
    ],
    "max-len": [1, 100, 4],
    "no-underscore-dangle": 0,
    "no-param-reassign": ["error", { "props": false }],
    "prefer-destructuring": "warn",
    "global-require": "warn",
    // "import/no-dynamic-require": "warn",
    "no-plusplus": "warn",
    "indent": ["error", 2],
    "comma-dangle": 0,
    "prefer-rest-params": 0,
    "quotes": ["error", "single", { "allowTemplateLiterals": true }],
    "class-methods-use-this": 0,
    "require-jsdoc": 0,
    "object-curly-spacing": 0,
    "prettier/prettier": "error"
  }
};
