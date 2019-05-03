module.exports = {
  "env": {
    "browser": true,
    "es6": true,
  },
  "extends": "google",
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
    "react",
  ],
  "rules": {
    "linebreak-style": [
      "error",
      process.platform === "win32" ? "windows" : "unix"
    ],
    "max-len": "warn",
    "no-underscore-dangle": 0,
    "no-param-reassign": ["error", { "props": false }],
    "prefer-destructuring": "warn",
    "global-require": "warn",
    // "import/no-dynamic-require": "warn",
    "no-plusplus": "warn",
    "indent": ["error", 4],
    "comma-dangle": 0,
    "prefer-rest-params": 0,
    "quotes": ["error", "double"],
    "class-methods-use-this": 0,
    "require-jsdoc": 0
  },
};
