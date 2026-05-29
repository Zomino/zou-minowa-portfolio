const eslintPluginAstro = require("eslint-plugin-astro");

module.exports = [
  ...eslintPluginAstro.configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
  },
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": "error",
    },
  },
  {
    ignores: ["dist/", "node_modules/", ".astro/"] ,
  },
];
