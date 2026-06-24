import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,mjs,ts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": "error",
    },
  },
  {
    ignores: ["**/dist/", "**/node_modules/"],
  },
];
